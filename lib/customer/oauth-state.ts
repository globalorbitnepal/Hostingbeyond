import type { JWTPayload } from "jose";

import { sanitizeCustomerRedirectPath } from "@/lib/customer/safe-redirect";
import type { OAuthProvider } from "@/lib/customer/oauth";
import { routes } from "@/config/routes";

export type VerifiedOAuthState = {
  provider: OAuthProvider;
  nextPath: string;
  returnOrigin: string;
};

export function nextPathFromOAuthStatePayload(
  payload: JWTPayload,
  expectedProvider: OAuthProvider,
): VerifiedOAuthState | null {
  if (payload.kind !== "oauth") return null;
  if (payload.provider !== expectedProvider) return null;
  const nextRaw =
    typeof payload.next === "string" ? payload.next : routes.account;
  const returnOrigin =
    typeof payload.returnOrigin === "string" &&
    payload.returnOrigin.startsWith("http")
      ? payload.returnOrigin.replace(/\/+$/, "")
      : "";
  if (!returnOrigin) return null;
  return {
    provider: expectedProvider,
    nextPath: sanitizeCustomerRedirectPath(nextRaw, routes.account),
    returnOrigin,
  };
}
