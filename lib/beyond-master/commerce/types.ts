export type CommerceProposalKind =
  "domain_register" | "nameserver_update" | "hosting_checkout";

export type CommerceProposalStatus =
  "pending" | "executing" | "executed" | "failed" | "cancelled" | "expired";

export type DomainRegisterPayload = {
  domain: string;
  currency: string;
  registerTotal: number;
  renewPrice: number;
  transferPrice: number;
  termNote: string;
  cartHref: string;
};

export type NameserverPayload = {
  domain: string;
  current: string[];
  proposed: string[];
};

export type HostingCheckoutPayload = {
  orderId: string;
  orderReference: string;
  productSlug: string;
  planKey: string;
  billingCycle: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  renewNote: string;
  checkoutPath: string;
};

export type HostingCheckoutPublicPayload = Omit<
  HostingCheckoutPayload,
  "orderId"
>;

export type CommerceProposalView = {
  publicId: string;
  kind: CommerceProposalKind;
  status: CommerceProposalStatus;
  expiresAt: string;
  summary: string;
  domainRegister?: DomainRegisterPayload;
  nameserver?: NameserverPayload;
  hostingCheckout?: HostingCheckoutPublicPayload;
  resultMessage?: string | null;
  verified?: boolean | null;
};

export type CommerceProposal = {
  publicId: string;
  customerUserId: string;
  kind: CommerceProposalKind;
  idempotencyKey: string;
  status: CommerceProposalStatus;
  expiresAt: Date;
  claimToken: string | null;
  payload: DomainRegisterPayload | NameserverPayload | HostingCheckoutPayload;
  resultMessage: string | null;
  verified: boolean | null;
  executionErrorCode: string | null;
};
