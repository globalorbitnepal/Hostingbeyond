import { createHash, randomBytes, timingSafeEqual } from "crypto";

const TOKEN_BYTES = 32;

function guestCapabilitySecret(
  env: Record<string, string | undefined>,
): string {
  return env.BEYOND_MASTER_GUEST_THREAD_SECRET?.trim() ?? "";
}

/** Stored in `BeyondMasterChatThread.guestKey` (hash only; never the raw token). */
export function hashGuestCapabilityToken(
  rawToken: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const secret = guestCapabilitySecret(env);
  const payload = secret ? `${secret}\0${rawToken}` : rawToken;
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

export function generateGuestCapabilityToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, "hex");
    const right = Buffer.from(b, "hex");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function guestCapabilityTokenLooksValid(
  raw: string | undefined,
): boolean {
  if (!raw || typeof raw !== "string") return false;
  const t = raw.trim();
  return t.length >= 32 && t.length <= 200;
}
