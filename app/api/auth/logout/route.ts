import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  CUSTOMER_SESSION_COOKIE,
  destroyCustomerSession,
} from "@/lib/customer/session";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_SESSION_COOKIE)?.value;
  await destroyCustomerSession(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
