/**
 * One rule for "do we need the old password?" across the settings UI and the
 * API, so they can never disagree.
 *
 * - Email/password account: the current password is required (proves the person
 *   at the keyboard owns the account, not just an open session).
 * - OAuth-only account: nothing to verify — there is no password yet.
 * - OAuth account that later added a password: still no prompt. The session is
 *   provider-backed, and this flow only ever replaces a password the same user
 *   could otherwise reset by email.
 */
export function requiresCurrentPassword(input: {
  hasPassword: boolean;
  oauthLinked: boolean;
}): boolean {
  return input.hasPassword && !input.oauthLinked;
}

export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(input: {
  newPassword: string;
  confirmPassword: string;
}): { ok: true } | { ok: false; error: string } {
  if (input.newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`,
    };
  }
  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, error: "New password and confirmation do not match." };
  }
  return { ok: true };
}
