import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  CUSTOMER_SESSION_COOKIE,
  getCustomerFromToken,
} from "@/lib/customer/session";
import { getSubscriptionForUser } from "@/lib/beyond-ai/subscription";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const user = await getCustomerFromToken(
    jar.get(CUSTOMER_SESSION_COOKIE)?.value,
  );
  if (!user) {
    return NextResponse.json({ subscription: null }, { status: 401 });
  }
  try {
    const subscription = await getSubscriptionForUser(user.id);
    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json({ subscription: null });
  }
}
