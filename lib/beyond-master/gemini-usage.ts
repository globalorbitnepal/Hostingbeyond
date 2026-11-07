import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { currentBudgetMonthKey } from "@/lib/beyond-master/ai-budget";
import {
  BEYOND_MASTER_AI_RATE_LIMIT,
  BEYOND_MASTER_AI_RATE_WINDOW_MS,
  BEYOND_MASTER_MONTHLY_CAP_CENTS,
} from "@/lib/beyond-master/limits";
import { beyondMasterAdminStatus } from "@/lib/beyond-master/settings";

/** Published Google AI Studio free-tier ceilings for Flash-Lite class models. */
export const GEMINI_FREE_TIER_PUBLISHED = {
  planName: "Google AI Studio free tier",
  rpm: 15,
  rpd: 1_500,
  tpm: 250_000,
  source: "Google AI Studio published rate limits for Flash-Lite class models",
};

function utcDayStart(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export type GeminiUsageSnapshot = {
  recorded: true;
  provider: string | null;
  model: string | null;
  credentialsPresent: boolean;
  monthKey: string;
  applicationCapCents: number;
  applicationSpentCents: number;
  applicationReservedCents: number;
  applicationRemainingCents: number;
  appRateLimit: string;
  published: typeof GEMINI_FREE_TIER_PUBLISHED;
  today: {
    geminiRequests: number;
    geminiSuccess: number;
    geminiRateLimited: number;
    geminiErrors: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  lastMinute: {
    geminiRequests: number;
  };
  note: string;
};

export async function readGeminiUsageSnapshot(
  env: Record<string, string | undefined> = process.env,
  now = new Date(),
): Promise<GeminiUsageSnapshot> {
  const status = beyondMasterAdminStatus(env);
  const dayStart = utcDayStart(now);
  const minuteStart = new Date(now.getTime() - 60_000);
  const monthKey = currentBudgetMonthKey(now);
  const geminiWhere: Prisma.BeyondMasterUsageWhereInput = {
    provider: { in: ["google", "gemini"] },
  };

  const [todayRows, minuteCount, budget] = await Promise.all([
    prisma.beyondMasterUsage.findMany({
      where: { ...geminiWhere, createdAt: { gte: dayStart } },
      select: {
        status: true,
        promptTokens: true,
        completionTokens: true,
      },
    }),
    prisma.beyondMasterUsage.count({
      where: { ...geminiWhere, createdAt: { gte: minuteStart } },
    }),
    prisma.beyondMasterAiBudgetMonth.findUnique({
      where: { monthKey },
      select: { spentCents: true, reservedCents: true },
    }),
  ]);

  let geminiSuccess = 0;
  let geminiRateLimited = 0;
  let geminiErrors = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  for (const row of todayRows) {
    if (row.status === "success") geminiSuccess += 1;
    else if (row.status === "rate_limited") geminiRateLimited += 1;
    else geminiErrors += 1;
    promptTokens += row.promptTokens ?? 0;
    completionTokens += row.completionTokens ?? 0;
  }
  const spent = budget?.spentCents ?? 0;
  const reserved = budget?.reservedCents ?? 0;

  return {
    recorded: true,
    provider: status.provider,
    model: status.model,
    credentialsPresent: status.credentialsPresent,
    monthKey,
    applicationCapCents: BEYOND_MASTER_MONTHLY_CAP_CENTS,
    applicationSpentCents: spent,
    applicationReservedCents: reserved,
    applicationRemainingCents: Math.max(
      0,
      BEYOND_MASTER_MONTHLY_CAP_CENTS - spent - reserved,
    ),
    appRateLimit: `${status.rateLimit || BEYOND_MASTER_AI_RATE_LIMIT} requests / ${Math.round((status.rateWindowMs || BEYOND_MASTER_AI_RATE_WINDOW_MS) / 1000)} seconds`,
    published: GEMINI_FREE_TIER_PUBLISHED,
    today: {
      geminiRequests: todayRows.length,
      geminiSuccess,
      geminiRateLimited,
      geminiErrors,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    lastMinute: { geminiRequests: minuteCount },
    note: "Request and token counts are recorded from live Gemini responses stored in HostingBeyond. Google does not return remaining free-tier quota on this API key, so the published RPM/RPD/TPM numbers are Google's documented ceilings, not a live Google bill.",
  };
}
