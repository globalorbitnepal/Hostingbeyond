import { NextResponse } from "next/server";

import { checkTransferEligibilityAsync } from "@/lib/domains/transfer-service";
import { resolveDomainRegistrarProvider } from "@/lib/domains/providers/index";
import {
  clientKeyFromRequest,
  rateLimitDomainSearch,
} from "@/lib/domains/rate-limit";
import type { TransferCheckResult } from "@/lib/domains/transfer";

export const runtime = "nodejs";

type Body = {
  domain?: string;
  /** Ignored — auth codes are collected only on secure checkout, never in this API. */
  authCode?: string;
};

/**
 * Transfer registry check (availability). No dedicated DNA transfer-eligibility endpoint;
 * set DOMAIN_TRANSFER_LOOKUP_URL to forward { domain } to an external registrar proxy.
 */
export async function POST(request: Request) {
  if (!rateLimitDomainSearch(clientKeyFromRequest(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const domain = body?.domain?.trim() ?? "";

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
        body: JSON.stringify({ domain }),
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
    result: await checkTransferEligibilityAsync(domain),
    source: resolveDomainRegistrarProvider() ? "registrar" : "hostingbeyond",
  });
}
