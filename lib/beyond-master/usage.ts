import { createHash } from "crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type BeyondMasterUsageDraft = {
  provider: string;
  model: string;
  status:
    | "success"
    | "error"
    | "timeout"
    | "unconfigured"
    | "rate_limited"
    | "aborted"
    | "account_read";
  latencyMs?: number;
  promptTokens?: number;
  completionTokens?: number;
  customerUserId?: string | null;
  ip?: string | null;
  errorCode?: string | null;
};

export function hashBeyondMasterIp(
  ip: string | null | undefined,
): string | null {
  const value = ip?.trim();
  if (!value || value === "unknown") return null;
  const salt =
    process.env.BEYOND_MASTER_AI_IP_SALT?.trim() || "beyond-master-ai";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export async function recordBeyondMasterUsage(
  draft: BeyondMasterUsageDraft,
  writer: (data: Prisma.BeyondMasterUsageCreateInput) => Promise<unknown> = (
    data,
  ) => prisma.beyondMasterUsage.create({ data }),
): Promise<{ stored: boolean; reason?: string }> {
  const data: Prisma.BeyondMasterUsageCreateInput = {
    provider: draft.provider.slice(0, 40) || "none",
    model: draft.model.slice(0, 80) || "none",
    status: draft.status,
    latencyMs: draft.latencyMs,
    promptTokens: draft.promptTokens,
    completionTokens: draft.completionTokens,
    customerUserId: draft.customerUserId ?? null,
    ipHash: hashBeyondMasterIp(draft.ip),
    errorCode: draft.errorCode?.slice(0, 80) ?? null,
  };
  try {
    await writer(data);
    return { stored: true };
  } catch (error) {
    const missing =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021";
    const reason = missing ? "table_missing" : "write_failed";
    console.error(
      JSON.stringify({
        source: "beyond-master-usage",
        stored: false,
        reason,
        status: draft.status,
        provider: data.provider,
      }),
    );
    return { stored: false, reason };
  }
}
