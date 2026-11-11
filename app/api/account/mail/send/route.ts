import { NextResponse } from "next/server";

import { requireCustomerSession } from "@/lib/domains/require-customer";
import { queueCustomerMail, validateMailDraft } from "@/lib/panel/agent-mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireCustomerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const draft = validateMailDraft((body ?? {}) as Record<string, unknown>);
  if (!draft) {
    return NextResponse.json(
      { error: "Check the recipient, subject, and message." },
      { status: 400 },
    );
  }
  const queued = await queueCustomerMail({
    userId: user.id,
    ...draft,
  });
  return NextResponse.json({
    ok: true,
    id: queued.id,
    status: queued.status,
    message:
      "Queued to send from your HostingBeyond mailbox. Delivery starts once a mailbox plan is active on this account.",
  });
}
