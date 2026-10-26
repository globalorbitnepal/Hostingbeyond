import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";

export async function GET() {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  });
}
