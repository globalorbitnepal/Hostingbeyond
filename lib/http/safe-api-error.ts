const PUBLIC_ADMIN_ERROR_CODES = new Set([
  "insufficient_funds",
  "invalid_amount",
  "invalid_credit_tx",
  "reason_required",
  "invoice_not_found",
  "void_not_allowed",
  "void_not_allowed_for_paid",
  "order_not_found",
  "provider_unconfigured",
  "provider_not_confirmed",
  "invalid_order_state",
  "order_missing_wallet",
  "provider_still_registered",
  "Prices cannot be negative",
]);

const ADMIN_NOT_FOUND_CODES = new Set(["invoice_not_found", "order_not_found"]);

/** Maps internal failures to generic client errors; keeps known validation codes. */
export function orbitAdminMutationError(
  error: unknown,
  fallback = "request_failed",
): { error: string; status: number } {
  const status =
    error && typeof error === "object" && "status" in error
      ? (error as { status?: unknown }).status
      : undefined;
  const message = error instanceof Error ? error.message : fallback;
  if (PUBLIC_ADMIN_ERROR_CODES.has(message)) {
    const resolved = ADMIN_NOT_FOUND_CODES.has(message) ? 404 : 400;
    return { error: message, status: resolved };
  }
  /**
   * Validation errors raised by catalog writes are safe to show: they describe
   * the admin's own invalid input and contain no internals.
   */
  if (status === 400) {
    return { error: message, status: 400 };
  }
  return { error: fallback, status: 502 };
}

const NAMESILO_CLIENT_CODES = new Set([
  "namesilo_api_key_missing",
  "namesilo_preview_failed",
  "namesilo_sync_failed",
]);

export function orbitNamesiloActionError(
  error: unknown,
  fallback: "namesilo_preview_failed" | "namesilo_sync_failed",
): { error: string; status: number } {
  const message = error instanceof Error ? error.message : fallback;
  if (message === "namesilo_api_key_missing") {
    return { error: message, status: 503 };
  }
  if (NAMESILO_CLIENT_CODES.has(message)) {
    return { error: message, status: 502 };
  }
  return { error: fallback, status: 502 };
}
