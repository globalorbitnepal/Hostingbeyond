import { cookies } from "next/headers";

import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";

export async function requireCustomerSession() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) return null;
  return user;
}

export function readIdempotencyKey(
  request: Request,
  bodyKey?: string | null,
): string {
  const header = request.headers.get("idempotency-key")?.trim();
  if (header && header.length <= 128) return header;
  if (bodyKey?.trim() && bodyKey.trim().length <= 128) return bodyKey.trim();
  return crypto.randomUUID();
}
