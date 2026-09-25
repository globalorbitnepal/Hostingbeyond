import { NextResponse } from "next/server";

import {
  checkTransferEligibility,
  type TransferCheckResult,
} from "@/lib/domains/transfer";

export const runtime = "nodejs";

type Body = {
  domain?: string;
  authCode?: string;
};

/**
 * Transfer eligibility check. Uses lib/domains/transfer today;
 * set DOMAIN_TRANSFER_LOOKUP_URL to forward { domain, authCode? } to a registrar.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const domain = body?.domain?.trim() ?? "";
  const authCode = body?.authCode?.trim() ?? "";

  if (!domain) {
    return NextResponse.json(
      { error: "Enter the domain you want to transfer." },
      { status: 400 },
    );
  }

  const upstream = process.env.DOMAIN_TRANSFER_LOOKUP_URL;
  if (upstream) {
    try {
      const response = await fetch(upstream, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.DOMAIN_TRANSFER_TOKEN
            ? { authorization: `Bearer ${process.env.DOMAIN_TRANSFER_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({ domain, authCode }),
        cache: "no-store",
      });
      if (response.ok) {
        const json = (await response.json()) as {
          result?: TransferCheckResult;
        };
        if (json.result?.domain) {
          return NextResponse.json({
            result: json.result,
            source: "registrar",
          });
        }
      }
    } catch {
      /* fall through */
    }
  }

  return NextResponse.json({
    result: checkTransferEligibility(domain, authCode),
    source: "hostingbeyond",
  });
}
