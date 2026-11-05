import { addDomainToCart } from "@/lib/domains/domain-cart-service";
import { assertAvailableForRegistration } from "@/lib/domains/registration-availability";
import { quoteRegistration } from "@/lib/domains/registration-service";
import { auditCommerceEvent } from "@/lib/beyond-master/commerce/audit";
import {
  beyondMasterCommerceStore,
  commerceExpiresAt,
  commerceIdempotencyKey,
  commerceProposalPublicId,
} from "@/lib/beyond-master/commerce/store";
import type { CommerceProposal } from "@/lib/beyond-master/commerce/types";
import {
  beginCommerceConfirm,
  finishCommerceExecution,
} from "@/lib/beyond-master/commerce/workflow";
import { commerceProposalView } from "@/lib/beyond-master/commerce/view";

const REGISTER =
  /\b(register|buy|purchase|get|acquire|order)\b.*\b(domain|name)\b|\b(domain|name)\b.*\b(register|buy|purchase)\b|दर्ता|खरीद|register karna|comprar dominio|acheter|registrar dominio/i;

export function wantsDomainRegistration(message: string): boolean {
  const text = message.trim();
  if (REGISTER.test(text)) return true;
  return (
    /\b(register|buy|purchase|acquire)\b/i.test(text) &&
    /\b[a-z0-9][a-z0-9-]*\.[a-z]{2,}\b/i.test(text)
  );
}

export async function prepareDomainRegistrationProposal(input: {
  customerUserId: string;
  domain: string;
}): Promise<
  | { ok: true; view: ReturnType<typeof commerceProposalView> }
  | { ok: false; error: string }
> {
  const quote = await quoteRegistration(input.domain);
  if (!quote.ok) {
    return { ok: false, error: quote.error };
  }
  let availability;
  try {
    availability = await assertAvailableForRegistration(quote.domain);
  } catch {
    return {
      ok: false,
      error: "That domain is not available to register.",
    };
  }
  if (
    availability.register == null ||
    (availability.status !== "available" && availability.status !== "premium")
  ) {
    return {
      ok: false,
      error: "That domain is not available to register.",
    };
  }

  const idempotencyKey = commerceIdempotencyKey(
    input.customerUserId,
    "domain_register",
    quote.domain,
  );
  const store = beyondMasterCommerceStore();
  const proposal: CommerceProposal = {
    publicId: commerceProposalPublicId(),
    customerUserId: input.customerUserId,
    kind: "domain_register",
    idempotencyKey,
    status: "pending",
    expiresAt: commerceExpiresAt(),
    claimToken: null,
    payload: {
      domain: quote.domain,
      currency: quote.currency,
      registerTotal: availability.register,
      renewPrice: quote.renew,
      transferPrice: quote.transfer,
      termNote:
        "First-year registration price; renewal billed at catalog renew rate.",
      cartHref: "/cart",
    },
    resultMessage: null,
    verified: null,
    executionErrorCode: null,
  };
  const saved = await store.insert(proposal);
  if (saved.publicId === proposal.publicId) {
    await auditCommerceEvent({
      event: "PROPOSAL_CREATED",
      customerUserId: input.customerUserId,
      proposalId: saved.publicId,
      kind: saved.kind,
      status: saved.status,
    });
  }
  if (saved.status === "pending") {
    await addDomainToCart(input.customerUserId, quote.domain).catch(() => null);
  }
  return { ok: true, view: commerceProposalView(saved) };
}

async function revalidateDomainRegistrationPayload(
  customerUserId: string,
  payload: { domain: string; registerTotal: number; currency: string },
): Promise<{ ok: true } | { ok: false; error: string; code: string }> {
  const quote = await quoteRegistration(payload.domain);
  if (!quote.ok) {
    return { ok: false, error: quote.error, code: "quote_failed" };
  }
  if (quote.domain !== payload.domain) {
    return { ok: false, error: "Domain mismatch.", code: "domain_mismatch" };
  }
  let availability;
  try {
    availability = await assertAvailableForRegistration(quote.domain);
  } catch {
    return {
      ok: false,
      error: "That domain is not available to register.",
      code: "unavailable",
    };
  }
  if (
    availability.register == null ||
    (availability.status !== "available" && availability.status !== "premium")
  ) {
    return {
      ok: false,
      error: "That domain is not available to register.",
      code: "unavailable",
    };
  }
  if (
    availability.register !== payload.registerTotal ||
    quote.currency !== payload.currency
  ) {
    return {
      ok: false,
      error: "Registration pricing changed. Start a new proposal.",
      code: "price_changed",
    };
  }
  return { ok: true };
}

export async function confirmDomainRegistrationProposal(input: {
  customerUserId: string;
  userEmail: string;
  publicId: string;
}): Promise<
  | { ok: true; view: ReturnType<typeof commerceProposalView> }
  | { ok: false; error: string; status: number }
> {
  const start = await beginCommerceConfirm({
    customerUserId: input.customerUserId,
    publicId: input.publicId,
    expectedKind: "domain_register",
  });
  if (!start.ok) {
    return { ok: false, error: start.error, status: start.status };
  }
  if (start.mode === "replay") {
    return { ok: true, view: start.view };
  }
  const payload = start.proposal.payload as {
    domain: string;
    registerTotal: number;
    currency: string;
  };
  const validated = await revalidateDomainRegistrationPayload(
    input.customerUserId,
    payload,
  );
  if (!validated.ok) {
    await finishCommerceExecution({
      proposal: start.proposal,
      success: false,
      resultMessage: validated.error,
      verified: false,
      errorCode: validated.code,
    });
    return { ok: false, error: validated.error, status: 409 };
  }
  const { processDomainRegistrationCheckout } =
    await import("@/lib/domains/registration-service");
  try {
    const result = await processDomainRegistrationCheckout({
      userId: input.customerUserId,
      userEmail: input.userEmail,
      domainInput: payload.domain,
      idempotencyKey: start.proposal.idempotencyKey,
    });
    if (!result.ok) {
      await finishCommerceExecution({
        proposal: start.proposal,
        success: false,
        resultMessage: result.error,
        verified: false,
        errorCode: `registration_${result.status}`,
      });
      return { ok: false, error: result.error, status: result.status };
    }
    const registered = result.order.status === "REGISTERED";
    const finished = await finishCommerceExecution({
      proposal: start.proposal,
      success: registered,
      resultMessage: registered
        ? `Registration recorded for ${result.order.domain} (${result.order.status}).`
        : `Order ${result.order.publicId} status ${result.order.status}. Payment or registrar steps may still be pending.`,
      verified: registered,
      errorCode: registered ? null : "not_registered_yet",
    });
    if (!registered) {
      return {
        ok: false,
        error: finished.resultMessage ?? "Registration is not complete yet.",
        status: 409,
      };
    }
    return { ok: true, view: commerceProposalView(finished) };
  } catch {
    await finishCommerceExecution({
      proposal: start.proposal,
      success: false,
      resultMessage: "Registration could not be completed.",
      verified: false,
      errorCode: "registrar_error",
    });
    return {
      ok: false,
      error: "Registration could not be completed.",
      status: 502,
    };
  }
}
