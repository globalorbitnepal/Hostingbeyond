import { quoteHostingCart } from "@/lib/hosting/cart/pricing";
import { settleHostingQuote } from "@/lib/hosting/cart/settlement";
import {
  hostingCheckoutHref,
  inferHostingBookingTarget,
} from "@/lib/hosting/checkout";
import { hostingOrderCustomerReference } from "@/lib/hosting/customer-hosting-orders";
import { upsertHostingDraftOrder } from "@/lib/hosting/hosting-orders";
import { createHostingOrderStripeCheckout } from "@/lib/hosting/hosting-order-stripe-payment";
import { settlementForRequest } from "@/lib/payments/request-settlement";
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
import { prisma } from "@/lib/prisma";

const HOSTING_BUY =
  /\b(buy|purchase|order|get|need)\b.*\b(hosting|plan|vps|wordpress hosting)\b|\b(hosting plan|web hosting)\b.*\b(buy|purchase)\b/i;

export function wantsHostingPurchase(message: string): boolean {
  return HOSTING_BUY.test(message.trim());
}

function inferPlanFromMessage(message: string): {
  productSlug: string;
  planKey: string;
  billing: "monthly" | "annually";
} | null {
  const billing = /\bmonthly\b/i.test(message) ? "monthly" : "annually";
  const slugMatch = message.match(
    /\b(web-hosting|wordpress-hosting|kvm-vps|business-hosting|ecommerce-hosting|nodejs-hosting)\b/i,
  );
  const planMatch = message.match(
    /\b(starter|essential|plus|pro|ultimate|basic|premium|vps-[a-z0-9-]+)\b/i,
  );
  if (slugMatch && planMatch) {
    return {
      productSlug: slugMatch[1]!.toLowerCase(),
      planKey: planMatch[1]!.toLowerCase(),
      billing,
    };
  }
  if (planMatch) {
    const inferred = inferHostingBookingTarget(planMatch[1]!.toLowerCase());
    if (inferred) {
      return {
        productSlug: inferred.product,
        planKey: inferred.plan,
        billing,
      };
    }
  }
  if (slugMatch) {
    return {
      productSlug: slugMatch[1]!.toLowerCase(),
      planKey: "starter",
      billing,
    };
  }
  return null;
}

export async function prepareHostingCheckoutProposal(input: {
  customerUserId: string;
  message: string;
}): Promise<
  | { ok: true; view: ReturnType<typeof commerceProposalView> }
  | { ok: false; error: string }
> {
  const target = inferPlanFromMessage(input.message);
  if (!target) {
    return {
      ok: false,
      error:
        "Name the hosting product and plan (for example web-hosting starter annually).",
    };
  }
  const quote = await quoteHostingCart({
    productSlug: target.productSlug,
    planKey: target.planKey,
    billingPeriod: target.billing === "monthly" ? "monthly" : "annually",
  });
  if (quote.errors.length) {
    return { ok: false, error: quote.errors.join(" ") };
  }
  const { currency, rate } = await settlementForRequest();
  const settlement = settleHostingQuote(quote, currency, rate);
  const order = await upsertHostingDraftOrder({
    userId: input.customerUserId,
    quote,
    status: "DRAFT",
    settlement,
  });
  const checkoutPath = hostingCheckoutHref(
    target.productSlug,
    target.planKey,
    target.billing,
  );
  const idempotencyKey = commerceIdempotencyKey(
    input.customerUserId,
    "hosting_checkout",
    order.id,
  );
  const proposal: CommerceProposal = {
    publicId: commerceProposalPublicId(),
    customerUserId: input.customerUserId,
    kind: "hosting_checkout",
    idempotencyKey,
    status: "pending",
    expiresAt: commerceExpiresAt(),
    claimToken: null,
    payload: {
      orderId: order.id,
      orderReference: hostingOrderCustomerReference(order.id),
      productSlug: target.productSlug,
      planKey: target.planKey,
      billingCycle: target.billing,
      currency: settlement.currency,
      subtotal: Number(settlement.subtotal),
      tax: Number(settlement.tax),
      total: Number(settlement.total),
      renewNote: "Renewal follows the plan billing cycle after the first term.",
      checkoutPath,
    },
    resultMessage: null,
    verified: null,
    executionErrorCode: null,
  };
  const saved = await beyondMasterCommerceStore().insert(proposal);
  if (saved.publicId === proposal.publicId) {
    await auditCommerceEvent({
      event: "PROPOSAL_CREATED",
      customerUserId: input.customerUserId,
      proposalId: saved.publicId,
      kind: saved.kind,
      status: saved.status,
    });
  }
  return { ok: true, view: commerceProposalView(saved) };
}

async function revalidateHostingCheckoutPayload(input: {
  customerUserId: string;
  payload: CommerceProposal["payload"] & {
    orderId: string;
    productSlug: string;
    planKey: string;
    billingCycle: string;
    total: number;
    currency: string;
  };
}): Promise<
  { ok: true; orderId: string } | { ok: false; error: string; code: string }
> {
  const order = await prisma.hostingOrder.findUnique({
    where: { id: input.payload.orderId },
  });
  if (!order || order.userId !== input.customerUserId) {
    return {
      ok: false,
      error: "Hosting order not found.",
      code: "order_not_found",
    };
  }
  if (order.productSlug !== input.payload.productSlug) {
    return { ok: false, error: "Plan changed.", code: "plan_mismatch" };
  }
  if (order.planKey !== input.payload.planKey) {
    return { ok: false, error: "Plan changed.", code: "plan_mismatch" };
  }
  const quote = await quoteHostingCart({
    productSlug: input.payload.productSlug,
    planKey: input.payload.planKey,
    billingPeriod:
      input.payload.billingCycle === "monthly" ? "monthly" : "annually",
  });
  if (quote.errors.length) {
    return { ok: false, error: quote.errors.join(" "), code: "quote_failed" };
  }
  const { currency, rate } = await settlementForRequest();
  const settlement = settleHostingQuote(quote, currency, rate);
  if (
    settlement.currency !== input.payload.currency ||
    Number(settlement.total) !== input.payload.total
  ) {
    return {
      ok: false,
      error: "Hosting pricing changed. Start a new proposal.",
      code: "price_changed",
    };
  }
  return { ok: true, orderId: order.id };
}

export async function confirmHostingCheckoutProposal(input: {
  customerUserId: string;
  publicId: string;
  idempotencyKey?: string;
}): Promise<
  | {
      ok: true;
      view: ReturnType<typeof commerceProposalView>;
      checkoutUrl?: string;
    }
  | { ok: false; error: string; status: number }
> {
  const start = await beginCommerceConfirm({
    customerUserId: input.customerUserId,
    publicId: input.publicId,
    expectedKind: "hosting_checkout",
  });
  if (!start.ok) {
    return { ok: false, error: start.error, status: start.status };
  }
  if (start.mode === "replay") {
    return { ok: true, view: start.view };
  }
  const payload = start.proposal.payload as CommerceProposal["payload"] & {
    orderId: string;
    productSlug: string;
    planKey: string;
    billingCycle: string;
    total: number;
    currency: string;
  };
  const validated = await revalidateHostingCheckoutPayload({
    customerUserId: input.customerUserId,
    payload,
  });
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
  const checkout = await createHostingOrderStripeCheckout({
    orderId: validated.orderId,
    userId: input.customerUserId,
    idempotencyKey: start.proposal.idempotencyKey,
  });
  if (!checkout.ok) {
    await finishCommerceExecution({
      proposal: start.proposal,
      success: false,
      resultMessage: checkout.error,
      verified: false,
      errorCode: `stripe_${checkout.status}`,
    });
    return { ok: false, error: checkout.error, status: checkout.status };
  }
  const finished = await finishCommerceExecution({
    proposal: start.proposal,
    success: true,
    resultMessage:
      "Stripe checkout opened. Payment and hosting activation follow Stripe and provisioning status — not this confirmation alone.",
    verified: false,
    errorCode: null,
  });
  return {
    ok: true,
    view: commerceProposalView(finished),
    checkoutUrl: checkout.checkoutUrl,
  };
}
