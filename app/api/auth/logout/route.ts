import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  CUSTOMER_SESSION_COOKIE,
  destroyCustomerSession,
} from "@/lib/customer/session";
import { crossOriginBrowserMutationBlocked } from "@/lib/http/same-origin-mutation";

export async function POST(request: Request) {
  if (crossOriginBrowserMutationBlocked(request, { strict: true })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
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
