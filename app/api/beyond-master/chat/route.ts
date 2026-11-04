import {
  beyondMasterTicketCustomerOverride,
  supportEventForChat,
} from "@/lib/beyond-master/tickets/http";
import { accountEventForChat } from "@/lib/beyond-master/account/chat";
import { dnsEventForChat, dnsPromptBlock } from "@/lib/beyond-master/dns/chat";
import { beyondMasterDnsRuntime } from "@/lib/beyond-master/dns/http";
import {
  extractDomainQuery,
  wantsDomainHelp,
} from "@/lib/beyond-master/domain-intent";
import {
  formatDomainSearchForPrompt,
  searchDomainsForAgent,
} from "@/lib/beyond-master/domain-search";
import { groundedBeyondMasterReply } from "@/lib/beyond-master/grounded";
import { buildBeyondMasterSystemPrompt } from "@/lib/beyond-master/knowledge/build";
import { getBeyondMasterChatTestOverride } from "@/lib/beyond-master/chat-test-hook";
import {
  BeyondMasterProviderError,
  publicProviderError,
  streamBeyondMasterProvider,
} from "@/lib/beyond-master/providers/stream";
import { allowBeyondMasterChat } from "@/lib/beyond-master/rate-limit";
import { parseBeyondMasterChatRequest } from "@/lib/beyond-master/request";
import { authorizeBeyondMasterModel } from "@/lib/beyond-master/model-registry";
import { readBeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import { recordBeyondMasterUsage } from "@/lib/beyond-master/usage";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import {
  clientKeyFromRequest,
  rateLimitResponse,
} from "@/lib/http/fixed-window-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Send valid JSON." }, { status: 400 });
  }
  const parsed = parseBeyondMasterChatRequest(payload);
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const modelChoice = authorizeBeyondMasterModel(parsed.model);
  if (parsed.model && !modelChoice.ok) {
    return Response.json({ error: modelChoice.error }, { status: 403 });
  }
  if (!allowBeyondMasterChat(request)) {
    await recordBeyondMasterUsage({
      provider: "none",
      model: "none",
      status: "rate_limited",
      ip: clientKeyFromRequest(request),
      errorCode: "rate_limited",
    });
    return Response.json(rateLimitResponse(), { status: 429 });
  }

  const overrideCustomer = beyondMasterTicketCustomerOverride();
  const verified = overrideCustomer
    ? { customerUserId: overrideCustomer.customerUserId }
    : await verifyCustomerJwt(cookieValue(request, CUSTOMER_SESSION_COOKIE));
  const customerUserId = verified?.customerUserId ?? null;
  const ip = clientKeyFromRequest(request);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };
      const started = Date.now();
      try {
        const support = await supportEventForChat(
          parsed.messages[parsed.messages.length - 1]?.content ?? "",
          customerUserId,
        );
        if (support) send("support", support);
        const account = await accountEventForChat(
          parsed.messages[parsed.messages.length - 1]?.content ?? "",
          customerUserId,
          ip,
        );
        if (account) {
          send("account", {
            cards: account.read.cards,
            signInRequired: account.read.signInRequired,
          });
        }
        const dnsRuntime = beyondMasterDnsRuntime();
        const dns = await dnsEventForChat({
          message: parsed.messages[parsed.messages.length - 1]?.content ?? "",
          userId: customerUserId,
          ports: dnsRuntime.ports,
          store: dnsRuntime.store,
        });
        if (dns) send("dns", dns);
        const override = getBeyondMasterChatTestOverride();
        const config = readBeyondMasterRuntimeConfig();
        const lastMessage =
          parsed.messages[parsed.messages.length - 1]?.content ?? "";
        const domainQuery = wantsDomainHelp(lastMessage)
          ? extractDomainQuery(lastMessage)
          : null;
        const domainSearch = domainQuery
          ? await searchDomainsForAgent(domainQuery)
          : null;
        if (domainSearch?.results.length) {
          send("domains", { results: domainSearch.results });
        }
        if (!override && !config.configured) {
          const grounded = await groundedBeyondMasterReply(lastMessage, () =>
            Promise.resolve(
              domainSearch ?? {
                query: domainQuery ?? lastMessage,
                error: null,
                results: [],
              },
            ),
          );
          if (grounded.domains.length) {
            send("domains", { results: grounded.domains });
          }
          send("delta", { text: grounded.text });
          await recordBeyondMasterUsage({
            provider: "grounded",
            model: "hostingbeyond-agent",
            status: "success",
            customerUserId,
            ip,
            latencyMs: Date.now() - started,
          });
          send("done", {});
          return;
        }
        let promptTokens: number | undefined;
        let completionTokens: number | undefined;
        let produced = false;
        const systemPrompt = `${await buildBeyondMasterSystemPrompt(
          lastMessage,
        )}${account?.prompt ? `\n\n${account.prompt}` : ""}${
          dns ? `\n\n${dnsPromptBlock(dns)}` : ""
        }${domainSearch ? `\n\n${formatDomainSearchForPrompt(domainSearch)}` : ""}`;
        const source = override
          ? override({ messages: parsed.messages, systemPrompt })
          : streamBeyondMasterProvider({
              config,
              messages: parsed.messages,
              systemPrompt,
              signal: request.signal,
            });
        for await (const event of source) {
          if (event.type === "delta") {
            produced = true;
            send("delta", { text: event.text });
          } else if (event.type === "usage") {
            promptTokens = event.promptTokens ?? promptTokens;
            completionTokens = event.completionTokens ?? completionTokens;
          }
        }
        if (!produced) {
          throw new BeyondMasterProviderError(
            "empty",
            "Provider returned no text.",
          );
        }
        await recordBeyondMasterUsage({
          provider: config.provider ?? "test",
          model: config.model ?? "test",
          status: "success",
          latencyMs: Date.now() - started,
          promptTokens,
          completionTokens,
          customerUserId,
          ip,
        });
        send("done", {});
      } catch (error) {
        if (
          error instanceof BeyondMasterProviderError &&
          error.code === "aborted"
        ) {
          await recordBeyondMasterUsage({
            provider: "none",
            model: "none",
            status: "aborted",
            customerUserId,
            ip,
            latencyMs: Date.now() - started,
            errorCode: "aborted",
          });
          return;
        }
        const code =
          error instanceof BeyondMasterProviderError ? error.code : "upstream";
        await recordBeyondMasterUsage({
          provider: "none",
          model: "none",
          status: code === "timeout" ? "timeout" : "error",
          customerUserId,
          ip,
          latencyMs: Date.now() - started,
          errorCode: code,
        });
        send("error", { message: publicProviderError(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
