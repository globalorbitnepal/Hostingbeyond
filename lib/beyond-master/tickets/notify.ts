import {
  isMailTransportConfigured,
  mailProviderConfigFlags,
} from "@/lib/support/mail-provider";

import type { NotificationRecord } from "@/lib/beyond-master/tickets/types";

/**
 * The existing mail transport is still the disabled provider. A ticket is
 * saved either way. Delivery stays false until a provider returns success.
 */
export async function recordTicketNotification(input: {
  reference: string;
  category: string;
  priority: string;
  customerEmail: string | null;
}): Promise<NotificationRecord> {
  const flags = mailProviderConfigFlags();
  const reason = isMailTransportConfigured(flags)
    ? "provider_not_verified"
    : "not_configured";
  void input.reference;
  void input.category;
  void input.priority;
  void input.customerEmail;
  return {
    customerDelivered: false,
    supportDelivered: false,
    customerReason: input.customerEmail ? reason : "customer_email_unavailable",
    supportReason: reason,
  };
}
