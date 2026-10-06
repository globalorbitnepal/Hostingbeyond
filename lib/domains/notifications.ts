import type { DomainOrderStatus } from "@prisma/client";

import {
  sendDomainRegistrationFailed,
  sendDomainRegistrationReconciliation,
  sendDomainRegistrationSuccess,
  sendDomainRenewalFailed,
  sendDomainRenewalSuccess,
  sendDomainTransferCompleted,
  sendDomainTransferFailed,
  sendDomainTransferStarted,
} from "@/lib/domains/email-hooks";

export async function notifyRegistrationSuccess(input: {
  email: string;
  domain: string;
  orderPublicId: string;
}) {
  await sendDomainRegistrationSuccess(input);
}

export async function notifyRegistrationFailed(input: {
  email: string;
  domain: string;
  message: string;
}) {
  await sendDomainRegistrationFailed(input);
}

export async function notifyRegistrationReconciliation(input: {
  email: string;
  domain: string;
}) {
  await sendDomainRegistrationReconciliation(input);
}

export async function notifyRenewalSuccess(input: {
  email: string;
  domain: string;
  expiresAt: string | null;
}) {
  await sendDomainRenewalSuccess(input);
}

export async function notifyRenewalFailed(input: {
  email: string;
  domain: string;
  message: string;
}) {
  await sendDomainRenewalFailed(input);
}

export async function notifyTransferStarted(input: {
  email: string;
  domain: string;
  publicId: string;
}) {
  await sendDomainTransferStarted(input);
}

export async function notifyTransferCompleted(input: {
  email: string;
  domain: string;
}) {
  await sendDomainTransferCompleted(input);
}

export async function notifyTransferFailed(input: {
  email: string;
  domain: string;
  message: string;
}) {
  await sendDomainTransferFailed(input);
}

export function customerMessageForOrderStatus(
  status: DomainOrderStatus,
): string {
  switch (status) {
    case "REGISTERED":
      return "Your domain registration is complete.";
    case "REGISTERING":
    case "PROCESSING":
      return "Your domain registration is in progress.";
    case "RECONCILIATION_REQUIRED":
      return "We're verifying your domain registration. Your payment has been safely held while we confirm the registration status.";
    case "FAILED":
      return "Registration could not be completed. Your account was not charged.";
    case "PENDING_PAYMENT":
      return "Complete payment to register this domain.";
    default:
      return "Order update.";
  }
}
