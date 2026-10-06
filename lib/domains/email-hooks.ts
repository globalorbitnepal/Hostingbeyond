/** Transactional email hooks — no mail transport configured; logs only. */

export type EmailPayload = Record<string, unknown>;

async function dispatch(template: string, payload: EmailPayload) {
  console.info(
    JSON.stringify({
      scope: "email",
      template,
      at: new Date().toISOString(),
      ...payload,
    }),
  );
}

export async function sendDomainRegistrationSuccess(payload: EmailPayload) {
  await dispatch("domain.registration.success", payload);
}

export async function sendDomainRegistrationFailed(payload: EmailPayload) {
  await dispatch("domain.registration.failed", payload);
}

export async function sendDomainRenewalSuccess(payload: EmailPayload) {
  await dispatch("domain.renewal.success", payload);
}

export async function sendDomainRenewalFailed(payload: EmailPayload) {
  await dispatch("domain.renewal.failed", payload);
}

export async function sendDomainTransferStarted(payload: EmailPayload) {
  await dispatch("domain.transfer.started", payload);
}

export async function sendDomainTransferCompleted(payload: EmailPayload) {
  await dispatch("domain.transfer.completed", payload);
}

export async function sendDomainTransferFailed(payload: EmailPayload) {
  await dispatch("domain.transfer.failed", payload);
}

export async function sendDomainRegistrationReconciliation(
  payload: EmailPayload,
) {
  await dispatch("domain.registration.reconciliation", payload);
}

export async function sendMigrationRequestReceived(payload: EmailPayload) {
  await dispatch("migration.request.received", payload);
}
