import {
  beyondMasterTicketCustomerOverride,
  supportEventForChat,
} from "@/lib/beyond-master/tickets/http";
import { accountEventForChat } from "@/lib/beyond-master/account/chat";
import { isAccountQuestion } from "@/lib/beyond-master/account/intent";
import { wantsNameserverChange } from "@/lib/beyond-master/commerce/nameservers";
import { runCustomerOperationsForChat } from "@/lib/beyond-master/operations/run";
import { toolsCoverAccountReads } from "@/lib/beyond-master/tools/account-tools";
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
import {
  groundedBeyondMasterReply,
  detectGroundedTopic,
} from "@/lib/beyond-master/grounded";
import { customerFirstName } from "@/lib/beyond-master/customer-name";
import {
  conversationLanguagePromptBlock,
  resolveConversationLocale,
} from "@/lib/beyond-master/language";
import { runReadOnlyAgentTools } from "@/lib/beyond-master/tools/run";
import { buildBeyondMasterSystemPrompt } from "@/lib/beyond-master/knowledge/build";
import { getBeyondMasterChatTestOverride } from "@/lib/beyond-master/chat-test-hook";
import {
  BeyondMasterProviderError,
  publicProviderError,
  streamBeyondMasterProvider,
} from "@/lib/beyond-master/providers/stream";
import { allowBeyondMasterChat } from "@/lib/beyond-master/rate-limit";
import {
  parseBeyondMasterChatRequest,
  trimBeyondMasterProviderContext,
} from "@/lib/beyond-master/request";
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
      let runtimeConfig = readBeyondMasterRuntimeConfig();
      let lastMessage = "";
      let accountPromptUsed = false;
      try {
        const support = await supportEventForChat(
          parsed.messages[parsed.messages.length - 1]?.content ?? "",
          customerUserId,
        );
        if (support) send("support", support);
        const override = getBeyondMasterChatTestOverride();
        runtimeConfig = readBeyondMasterRuntimeConfig();
        lastMessage =
          parsed.messages[parsed.messages.length - 1]?.content ?? "";
        const firstName = await customerFirstName(customerUserId);
        const toolRun = await runReadOnlyAgentTools({
          message: lastMessage,
          ctx: { customerUserId, ip },
        });
        if (toolRun.calls.length) {
          send("tools", {
            tools: toolRun.calls.map((row) => row.tool),
            results: toolRun.results.map((row) =>
              row.ok
                ? { tool: row.tool, ok: true }
                : {
                    tool: row.tool,
                    ok: false,
                    code: row.code,
                    signInRequired: row.signInRequired ?? false,
                  },
            ),
          });
        }
        let accountPrompt = "";
        if (
          isAccountQuestion(lastMessage) &&
          toolsCoverAccountReads(toolRun.calls)
        ) {
          accountPromptUsed = Boolean(toolRun.promptBlock);
          accountPrompt = toolRun.promptBlock;
          send("account", {
            cards: toolRun.accountCards,
            signInRequired: !customerUserId,
          });
        } else {
          const account = await accountEventForChat(
            lastMessage,
            customerUserId,
            ip,
          );
          if (account) {
            accountPromptUsed = Boolean(account.prompt);
            accountPrompt = account.prompt;
            send("account", {
              cards: account.read.cards,
              signInRequired: account.read.signInRequired,
            });
          }
        }
        const operations = await runCustomerOperationsForChat({
          message: lastMessage,
          customerUserId,
        });
        if (operations.proposal) {
          send("commerce", {
            kind: "proposal",
            state: "confirmation_required",
            proposal: operations.proposal,
          });
        } else if (operations.notice) {
          send("commerce", { kind: "notice", message: operations.notice });
        }
        const dnsRuntime = beyondMasterDnsRuntime();
        const dns =
          operations.proposal?.kind === "nameserver_update" ||
          wantsNameserverChange(lastMessage)
            ? null
            : await dnsEventForChat({
                message: lastMessage,
                userId: customerUserId,
                ports: dnsRuntime.ports,
                store: dnsRuntime.store,
              });
        if (dns) send("dns", dns);
        if (toolRun.dnsRecords) {
          send("dns", {
            kind: "records",
            domain: toolRun.dnsRecords.domain,
            records: toolRun.dnsRecords.records,
          });
        }
        const conversationLocale = resolveConversationLocale(
          parsed.messages,
          parsed.preferredLocale,
        );
        const domainQuery =
          wantsDomainHelp(lastMessage) &&
          !/\bbulk\b/i.test(lastMessage) &&
          !toolRun.results.some((row) => row.ok && row.tool === "search_domain")
            ? extractDomainQuery(lastMessage)
            : null;
        const domainSearch = domainQuery
          ? await searchDomainsForAgent(domainQuery)
          : toolRun.domainResults.length
            ? {
                query: lastMessage,
                error: null,
                results: toolRun.domainResults,
              }
            : null;
        if (domainSearch?.results.length) {
          send("domains", { results: domainSearch.results });
        }
        if (!override && !runtimeConfig.configured) {
          const grounded = await groundedBeyondMasterReply(
            lastMessage,
            () =>
              Promise.resolve(
                domainSearch ?? {
                  query: domainQuery ?? lastMessage,
                  error: null,
                  results: [],
                },
              ),
            firstName,
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
        )}\n\n${conversationLanguagePromptBlock(
          parsed.messages,
          parsed.preferredLocale ?? conversationLocale,
        )}${
          toolRun.promptBlock ? `\n\n${toolRun.promptBlock}` : ""
        }${accountPrompt ? `\n\n${accountPrompt}` : ""}${
          operations.promptBlock ? `\n\n${operations.promptBlock}` : ""
        }${dns ? `\n\n${dnsPromptBlock(dns)}` : ""}${
          domainSearch ? `\n\n${formatDomainSearchForPrompt(domainSearch)}` : ""
        }`;
        const providerMessages = trimBeyondMasterProviderContext(
          parsed.messages,
        );
        const source = override
          ? override({ messages: providerMessages, systemPrompt })
          : streamBeyondMasterProvider({
              config: runtimeConfig,
              messages: providerMessages,
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
          provider: runtimeConfig.provider ?? "test",
          model: runtimeConfig.model ?? "test",
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
        const usageStatus =
          code === "rate_limited"
            ? "rate_limited"
            : code === "timeout"
              ? "timeout"
              : "error";
        if (
          code === "model_unavailable" &&
          detectGroundedTopic(lastMessage) &&
          !accountPromptUsed
        ) {
          const grounded = await groundedBeyondMasterReply(
            lastMessage,
            () =>
              Promise.resolve({
                query: lastMessage,
                error: null,
                results: [],
              }),
            await customerFirstName(customerUserId),
          );
          send("delta", { text: grounded.text });
          await recordBeyondMasterUsage({
            provider: "grounded",
            model: "hostingbeyond-agent",
            status: "success",
            customerUserId,
            ip,
            latencyMs: Date.now() - started,
            errorCode: "model_unavailable_grounded",
          });
          send("done", {});
          return;
        }
        await recordBeyondMasterUsage({
          provider: runtimeConfig.provider ?? "none",
          model: runtimeConfig.model ?? "none",
          status: usageStatus,
          customerUserId,
          ip,
          latencyMs: Date.now() - started,
          errorCode: code,
        });
        send("error", {
          message: publicProviderError(
            error,
            resolveConversationLocale(parsed.messages, parsed.preferredLocale),
          ),
        });
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
