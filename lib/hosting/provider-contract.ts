/**
 * Future hosting-panel contract. No HTTP client is implemented — do not treat
 * this module as a live provider. Required env names (values never logged):
 * HOSTING_PROVISIONER_ENABLED, HOSTING_PROVISIONER_BASE_URL,
 * HOSTING_PROVISIONER_API_TOKEN, HOSTING_PROVISIONER_WEBHOOK_SECRET.
 *
 * Accept: POST {orderPublicRef, productSlug, planKey, billingCycle, idempotencyKey}
 *   → { accepted: true, providerRequestId: string }
 * Confirm (provider callback / poll): { confirmed: true, providerAccountRef: string }
 * Fail: { confirmed: false, retryable: boolean, errorCode?: string }
 */

export type HostingProviderAcceptPayload = {
  accepted: true;
  providerRequestId: string;
};

export type HostingProviderConfirmPayload =
  | { confirmed: true; providerAccountRef: string }
  | { confirmed: false; retryable: boolean; errorCode?: string };

export function parseHostingProviderAcceptPayload(
  raw: unknown,
):
  | { ok: true; payload: HostingProviderAcceptPayload }
  | { ok: false; reason: "invalid_provider_response" } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "invalid_provider_response" };
  }
  const body = raw as Record<string, unknown>;
  const requestId =
    typeof body.providerRequestId === "string"
      ? body.providerRequestId.trim()
      : "";
  if (body.accepted !== true || requestId.length < 8) {
    return { ok: false, reason: "invalid_provider_response" };
  }
  return {
    ok: true,
    payload: { accepted: true, providerRequestId: requestId },
  };
}

export function parseHostingProviderConfirmPayload(
  raw: unknown,
):
  | { ok: true; payload: HostingProviderConfirmPayload }
  | { ok: false; reason: "invalid_provider_response" } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "invalid_provider_response" };
  }
  const body = raw as Record<string, unknown>;
  if (body.confirmed === true) {
    const ref =
      typeof body.providerAccountRef === "string"
        ? body.providerAccountRef.trim()
        : "";
    if (ref.length < 8) {
      return { ok: false, reason: "invalid_provider_response" };
    }
    return {
      ok: true,
      payload: { confirmed: true, providerAccountRef: ref },
    };
  }
  if (body.confirmed === false) {
    return {
      ok: true,
      payload: {
        confirmed: false,
        retryable: body.retryable === true,
        errorCode:
          typeof body.errorCode === "string" ? body.errorCode : undefined,
      },
    };
  }
  return { ok: false, reason: "invalid_provider_response" };
}

export const HOSTING_PROVISIONER_ENV_NAMES = [
  "HOSTING_PROVISIONER_ENABLED",
  "HOSTING_PROVISIONER_BASE_URL",
  "HOSTING_PROVISIONER_API_TOKEN",
  "HOSTING_PROVISIONER_WEBHOOK_SECRET",
] as const;

/** Operator checklist — not implemented until provider + isolated DB are approved. */
export const HOSTING_PROVISIONER_INTEGRATION_STEPS = [
  "Select hosting panel API and staging credentials.",
  "Implement HostingProvisioner adapter (accept → PROVISIONING only).",
  "Verify provider callbacks with verifyHostingProviderCallbackSignature.",
  "Persist providerRequestId on HostingOrder (schema migration + approval).",
  "Wire Stripe checkout duplicate handling to decideHostingProvisionDispatch.",
  "Mark ACTIVE only via statusAfterProviderConfirm after provider confirm.",
  "Run integration tests on hostingbeyond_integration_user only.",
] as const;
