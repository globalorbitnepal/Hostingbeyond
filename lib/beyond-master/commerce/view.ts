import type {
  CommerceProposal,
  CommerceProposalView,
  DomainRegisterPayload,
  HostingCheckoutPayload,
  NameserverPayload,
} from "@/lib/beyond-master/commerce/types";

export function commerceProposalView(
  proposal: CommerceProposal,
): CommerceProposalView {
  const base = {
    publicId: proposal.publicId,
    kind: proposal.kind,
    status: proposal.status,
    expiresAt: proposal.expiresAt.toISOString(),
    resultMessage: proposal.resultMessage,
    verified: proposal.verified,
    summary: "",
  };
  if (proposal.kind === "domain_register") {
    const payload = proposal.payload as DomainRegisterPayload;
    return {
      ...base,
      summary: `Register ${payload.domain} for ${payload.registerTotal} ${payload.currency} (renew ${payload.renewPrice} ${payload.currency}/yr).`,
      domainRegister: payload,
    };
  }
  if (proposal.kind === "nameserver_update") {
    const payload = proposal.payload as NameserverPayload;
    return {
      ...base,
      summary: `Update nameservers for ${payload.domain}.`,
      nameserver: payload,
    };
  }
  const payload = proposal.payload as HostingCheckoutPayload;
  const { orderId: _hidden, ...publicHosting } = payload;
  return {
    ...base,
    summary: `Hosting checkout ${payload.productSlug} / ${payload.planKey} — ${payload.total} ${payload.currency} (${payload.billingCycle}).`,
    hostingCheckout: publicHosting,
  };
}

export function commercePromptBlock(view: CommerceProposalView): string {
  if (view.kind === "domain_register" && view.domainRegister) {
    const row = view.domainRegister;
    return [
      "A domain registration proposal is waiting for the customer to click Confirm.",
      "Do not say the domain is registered until confirmation succeeds.",
      `Proposal ${view.publicId}: ${row.domain} register ${row.registerTotal} ${row.currency}, renew ${row.renewPrice} ${row.currency}. ${row.termNote}`,
      `Cart: ${row.cartHref}`,
    ].join("\n");
  }
  if (view.kind === "nameserver_update" && view.nameserver) {
    const row = view.nameserver;
    return [
      "A nameserver change proposal is waiting for Confirm.",
      "Do not say nameservers were updated until confirmation succeeds.",
      `Proposal ${view.publicId} domain ${row.domain}`,
      `Current: ${row.current.join(", ") || "none on file"}`,
      `Proposed: ${row.proposed.join(", ")}`,
    ].join("\n");
  }
  if (view.kind === "hosting_checkout" && view.hostingCheckout) {
    const row = view.hostingCheckout;
    return [
      "A hosting checkout proposal is waiting for Confirm.",
      "Payment and activation happen only after Stripe checkout completes — do not claim hosting is live yet.",
      `Proposal ${view.publicId}: ${row.productSlug} ${row.planKey} ${row.total} ${row.currency} ${row.billingCycle}. ${row.renewNote}`,
      `Checkout path: ${row.checkoutPath}`,
    ].join("\n");
  }
  return `Commerce proposal ${view.publicId} (${view.kind}) awaiting confirmation.`;
}
