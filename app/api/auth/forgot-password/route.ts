import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimitResponse } from "@/lib/http/fixed-window-rate-limit";
import { rateLimitAuthEndpoint } from "@/lib/http/public-endpoint-rate-limit";

const schema = z.object({
  email: z.string().email().max(200),
});

/**
 * Self-service password reset is not implemented (no transactional email provider wired).
 * This endpoint exists so clients cannot pretend a reset was sent.
 */
export async function POST(request: Request) {
  if (!rateLimitAuthEndpoint(request)) {
    return NextResponse.json(rateLimitResponse(), { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      error:
        "Automated password reset is not available yet. Contact support at hello@hostingbeyond.com for account recovery.",
      code: "password_reset_not_configured",
    },
    { status: 501 },
  );
}
