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
import { agentCopyForLocale } from "@/lib/beyond-master/replies";
import {
  shouldSkipGeminiForAuthenticatedTopic,
  shouldSkipGeminiForGuest,
} from "@/lib/beyond-master/agent-guest";
import {
  actualCentsFromTokenUsage,
  reconcilePaidAiBudget,
  reserveCentsForAiCall,
  reservePaidAiBudget,
} from "@/lib/beyond-master/ai-budget";
import { toolResultPromptLines } from "@/lib/beyond-master/tools/handlers";
import { runReadOnlyAgentTools } from "@/lib/beyond-master/tools/run";
import { isGuestAllowedReadOnlyTool } from "@/lib/beyond-master/tools/types";
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
import { readOperatorFeatures } from "@/lib/beyond-master/operator-features";
import { readBeyondMasterRuntimeConfig } from "@/lib/beyond-master/settings";
import { recordBeyondMasterUsage } from "@/lib/beyond-master/usage";
import { principalForPublicBeyondMasterChat } from "@/lib/beyond-master/authorization";
import {
  CUSTOMER_SESSION_COOKIE,
  verifyCustomerJwt,
} from "@/lib/customer/session";
import { getSessionAdmin, ORBIT_SESSION_COOKIE } from "@/lib/orbit/session";
import { orbitAccessForAdmin } from "@/lib/orbit/staff-access";
import { randomUUID } from "crypto";
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
  const overrideCustomer = beyondMasterTicketCustomerOverride();
  const verified = overrideCustomer
    ? { customerUserId: overrideCustomer.customerUserId }
    : await verifyCustomerJwt(cookieValue(request, CUSTOMER_SESSION_COOKIE));
  const customerUserId = verified?.customerUserId ?? null;
  let orbitAdmin: Awaited<ReturnType<typeof getSessionAdmin>> = null;
  if (!customerUserId) {
    const orbitToken = cookieValue(request, ORBIT_SESSION_COOKIE);
    orbitAdmin = await getSessionAdmin(orbitToken);
  }
  const orbitAccessMode = orbitAdmin
    ? orbitAccessForAdmin(orbitAdmin.id)
    : null;
  const chatPrincipal = principalForPublicBeyondMasterChat({
    customerUserId,
    orbitAdmin,
    orbitAccessMode,
  });
  const ip = clientKeyFromRequest(request);
  const features = await readOperatorFeatures();
  if (!features.publicChat) {
    return Response.json(
      { error: "The assistant is turned off." },
      { status: 403 },
    );
  }
  if (!customerUserId && !features.guestChat) {
    return Response.json(
      { error: "Guest chat is turned off. Sign in to continue." },
      { status: 403 },
    );
  }

  if (!(await allowBeyondMasterChat(request, process.env, customerUserId))) {
    await recordBeyondMasterUsage({
      provider: "none",
      model: "none",
      status: "rate_limited",
      ip: clientKeyFromRequest(request),
      errorCode: "rate_limited",
    });
    return Response.json(rateLimitResponse(), { status: 429 });
  }
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
      let budgetRequestIdForReconcile: string | null = null;
      try {
        const support = await supportEventForChat(
          parsed.messages[parsed.messages.length - 1]?.content ?? "",
          customerUserId,
          {
            threadId: parsed.threadId,
            guestCapabilityToken: customerUserId
              ? null
              : (parsed.guestCapabilityToken ?? null),
            humanQueue: features.humanQueue,
          },
        );
        if (support) send("support", support);
        if (support?.kind === "human_queue" && features.humanQueue) {
          send("delta", { text: support.message });
          await recordBeyondMasterUsage({
            provider: "grounded",
            model: "hostingbeyond-agent",
            status: "success",
            customerUserId,
            ip,
            latencyMs: Date.now() - started,
            errorCode: support.queued ? "human_queue" : "human_queue_failed",
          });
          send("done", {});
          return;
        }
        const override = getBeyondMasterChatTestOverride();
        runtimeConfig = readBeyondMasterRuntimeConfig();
        lastMessage =
          parsed.messages[parsed.messages.length - 1]?.content ?? "";
        const firstName = await customerFirstName(customerUserId);
        const toolRun = features.accountTools
          ? await runReadOnlyAgentTools({
              message: lastMessage,
              ctx: { customerUserId, ip, chatPrincipal },
            })
          : {
              calls: [],
              results: [],
              promptBlock: "",
              domainResults: [],
              accountCards: [],
              dnsRecords: null,
            };
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
        } else if (customerUserId || !isAccountQuestion(lastMessage)) {
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
        if (
          !customerUserId &&
          isAccountQuestion(lastMessage) &&
          !toolsCoverAccountReads(toolRun.calls)
        ) {
          const guestCopy = agentCopyForLocale(
            parsed.preferredLocale ?? conversationLocale,
          );
          send("delta", { text: guestCopy.guestSignInForAccount });
          await recordBeyondMasterUsage({
            provider: "grounded",
            model: "hostingbeyond-agent",
            status: "success",
            customerUserId,
            ip,
            latencyMs: Date.now() - started,
            errorCode: "guest_account_guidance",
          });
          send("done", {});
          return;
        }
        const domainQuery =
          features.groundedCatalog &&
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
          if (!features.groundedCatalog) {
            send("delta", {
              text: "Catalog answers are turned off. Ask a HostingBeyond specialist from your account, or try again later.",
            });
            await recordBeyondMasterUsage({
              provider: "none",
              model: "none",
              status: "success",
              customerUserId,
              ip,
              latencyMs: Date.now() - started,
              errorCode: "catalog_disabled",
            });
            send("done", {});
            return;
          }
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

        const groundedPreview = features.groundedCatalog
          ? await groundedBeyondMasterReply(
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
            )
          : { text: "", domains: [], language: "en" as const };
        const guestSkipDeterministic =
          features.groundedCatalog &&
          !customerUserId &&
          !override &&
          runtimeConfig.configured &&
          shouldSkipGeminiForGuest({
            lastMessage,
            toolCalls: toolRun.calls,
            toolResults: toolRun.results,
            domainResultCount: domainSearch?.results.length ?? 0,
            hasCommerceProposal: Boolean(operations.proposal),
            hasCommerceNotice: Boolean(operations.notice),
            grounded: groundedPreview,
          });
        const authTopicSkip =
          features.groundedCatalog &&
          Boolean(customerUserId) &&
          !override &&
          runtimeConfig.configured &&
          shouldSkipGeminiForAuthenticatedTopic({
            lastMessage,
            toolCalls: toolRun.calls,
            hasCommerceProposal: Boolean(operations.proposal),
            hasCommerceNotice: Boolean(operations.notice),
            hasDnsPrompt: Boolean(dns),
            accountPromptUsed,
          });
        if (guestSkipDeterministic || authTopicSkip) {
          let replyText = groundedPreview.text;
          if (
            guestSkipDeterministic &&
            toolRun.calls.length > 0 &&
            toolRun.calls.every((c) => isGuestAllowedReadOnlyTool(c.tool)) &&
            toolRun.results.some((row) => row.ok)
          ) {
            replyText = toolRun.results
              .filter((row) => row.ok)
              .flatMap((row) => toolResultPromptLines(row))
              .join("\n");
          }
          if (
            groundedPreview.domains.length &&
            !toolRun.results.some(
              (row) => row.ok && row.tool === "search_domain",
            )
          ) {
            send("domains", { results: groundedPreview.domains });
          }
          send("delta", { text: replyText });
          await recordBeyondMasterUsage({
            provider: "grounded",
            model: "hostingbeyond-agent",
            status: "success",
            customerUserId,
            ip,
            latencyMs: Date.now() - started,
            errorCode: guestSkipDeterministic
              ? "guest_deterministic"
              : "auth_topic_deterministic",
          });
          send("done", {});
          return;
        }
        let promptTokens: number | undefined;
        let completionTokens: number | undefined;
        let produced = false;
        const budgetRequestId = randomUUID();
        const reserveCents = reserveCentsForAiCall(process.env);
        if (!override && runtimeConfig.configured) {
          const gate = await reservePaidAiBudget({
            requestId: budgetRequestId,
            customerUserId,
            reserveCents,
          });
          if (!gate.ok && gate.code === "hard_stop") {
            send("delta", {
              text:
                gate.message ||
                "Monthly AI usage cap reached. This is an application limit and does not replace provider billing alerts.",
            });
            send("budget", {
              level: "hard_stop",
              spentPlusReservedCents: gate.spentPlusReservedCents,
            });
            await recordBeyondMasterUsage({
              provider: runtimeConfig.provider ?? "none",
              model: runtimeConfig.model ?? "none",
              status: "error",
              customerUserId,
              ip,
              latencyMs: Date.now() - started,
              errorCode: "budget_hard_stop",
            });
            send("done", {});
            return;
          }
          if (gate.ok) {
            budgetRequestIdForReconcile = budgetRequestId;
          }
          if (gate.ok && (gate.level === "warn" || gate.level === "critical")) {
            send("budget", {
              level: gate.level,
              spentPlusReservedCents: gate.spentPlusReservedCents,
            });
          }
        }
        const systemPrompt = `${await buildBeyondMasterSystemPrompt(
          lastMessage,
          {
            includeKnowledge: features.knowledge,
            includeCatalog: features.groundedCatalog,
          },
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
        const actualCents = actualCentsFromTokenUsage({
          promptTokens,
          completionTokens,
        });
        if (!override && runtimeConfig.configured) {
          await reconcilePaidAiBudget({
            requestId: budgetRequestId,
            actualCents,
          });
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
        if (budgetRequestIdForReconcile) {
          await reconcilePaidAiBudget({
            requestId: budgetRequestIdForReconcile,
            actualCents: 0,
          });
        }
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
          features.groundedCatalog &&
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
