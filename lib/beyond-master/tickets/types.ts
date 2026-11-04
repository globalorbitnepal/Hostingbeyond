export const TICKET_CATEGORIES = [
  "domain",
  "dns",
  "hosting",
  "developer-hosting",
  "vps",
  "ssl",
  "business-email",
  "website",
  "billing",
  "payment",
  "account",
  "other",
] as const;

export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_customer",
  "waiting_support",
  "resolved",
  "closed",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type TicketDraftInput = {
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  domainName: string | null;
  domainId: string | null;
  serviceId: string | null;
  serviceLabel: string | null;
  handoff: boolean;
  contextNote: string | null;
};

export type PreparedTicketDraft = TicketDraftInput & {
  confirmationId: string;
  expiresAt: string;
};

export type CustomerTicketMessage = {
  publicId: string;
  authorType: "customer" | "support" | "system";
  body: string;
  createdAt: string;
};

export type CustomerTicketView = {
  reference: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  domainName: string | null;
  serviceLabel: string | null;
  handoff: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: CustomerTicketMessage[];
  notification: NotificationRecord;
};

export type NotificationRecord = {
  customerDelivered: false;
  supportDelivered: false;
  customerReason: string;
  supportReason: string;
};

export type AdminTicketListItem = {
  reference: string;
  subject: string;
  customerRef: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  handoff: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminQueueInput = {
  status: TicketStatus | null;
  priority: TicketPriority | null;
  category: TicketCategory | null;
  query: string;
  sort: "created" | "updated";
  page: number;
  pageSize: number;
};

export type AdminQueueResult = {
  ok: true;
  counts: AdminTicketCounts;
  tickets: AdminTicketListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminTicketCounts = {
  total: number;
  open: number;
  in_progress: number;
  waiting_customer: number;
  waiting_support: number;
  resolved: number;
  closed: number;
  urgent: number;
};

export type AdminTicketView = CustomerTicketView & {
  customerUserId: string;
  assigneeId: string | null;
  domainId: string | null;
  serviceId: string | null;
  contextNote: string | null;
  internalNotes: CustomerTicketMessage[];
  activity: {
    action: string;
    actorType: string;
    detail: string | null;
    createdAt: string;
  }[];
};
