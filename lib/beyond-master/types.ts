/** Client conversation shape for Beyond Master AI. Phase 3 replaces the notice path with a server reply. */

export type BeyondMasterMessageStatus = "pending" | "sent" | "failed";

export type BeyondMasterMessageRole = "user" | "assistant" | "notice";

export type BeyondMasterNoticeCode = "provider_not_configured";

export type BeyondMasterMessage = {
  id: string;
  role: BeyondMasterMessageRole;
  body: string;
  createdAt: string;
  status: BeyondMasterMessageStatus;
  code?: BeyondMasterNoticeCode;
};

export type BeyondMasterConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** BCP-47 locale persisted for this browser conversation tab. */
  preferredLanguage?: string;
  messages: BeyondMasterMessage[];
};

export type BeyondMasterQuickAction = {
  id: string;
  label: string;
  prompt: string;
};

export type BeyondMasterDomainSuggestion = {
  domain: string;
  status: string;
  register: number | null;
  href: string;
};
