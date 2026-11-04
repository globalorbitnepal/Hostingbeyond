/**
 * Orbit session policy. A protected page or API is allowed only when the JWT
 * is valid and a matching unexpired AdminSession row was read. A missing row,
 * a revoked row, an expired row, and a database outage all fail closed.
 * There is no JWT-only bypass.
 */
export type OrbitSessionTrust =
  | {
      outcome: "reject";
      reason:
        | "jwt_invalid"
        | "session_expired"
        | "session_missing"
        | "database_unavailable";
    }
  | { outcome: "database_session" };

export function decideOrbitSessionTrust(input: {
  jwtValid: boolean;
  hasAdminUserId: boolean;
  databaseUnavailable: boolean;
  sessionFound: boolean;
  sessionExpired: boolean;
}): OrbitSessionTrust {
  if (!input.jwtValid || !input.hasAdminUserId)
    return { outcome: "reject", reason: "jwt_invalid" };
  if (input.databaseUnavailable)
    return { outcome: "reject", reason: "database_unavailable" };
  if (input.sessionFound && input.sessionExpired)
    return { outcome: "reject", reason: "session_expired" };
  if (input.sessionFound) return { outcome: "database_session" };
  return { outcome: "reject", reason: "session_missing" };
}
