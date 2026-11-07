import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  beyondMasterCapabilityEnabled,
  beyondMasterCommerceEnabled,
  capabilityEnvName,
  type BeyondMasterCapability,
} from "@/lib/beyond-master/capabilities";

export const BEYOND_MASTER_FEATURE_ROW_ID = "beyond-master-agent";

export const OPERATOR_FEATURE_KEYS = [
  "publicChat",
  "guestChat",
  "voiceInput",
  "humanQueue",
  "knowledge",
  "accountTools",
  "groundedCatalog",
] as const;

export type OperatorFeatureKey = (typeof OPERATOR_FEATURE_KEYS)[number];

export type OperatorFeatures = Record<OperatorFeatureKey, boolean>;

export const DEFAULT_OPERATOR_FEATURES: OperatorFeatures = {
  publicChat: true,
  guestChat: true,
  voiceInput: true,
  humanQueue: true,
  knowledge: true,
  accountTools: true,
  groundedCatalog: true,
};

const FEATURE_LABELS: Record<OperatorFeatureKey, string> = {
  publicChat: "Public AI chat",
  guestChat: "Guest chat (signed-out visitors)",
  voiceInput: "Voice input (hold to talk)",
  humanQueue: "Human support queue",
  knowledge: "Knowledge-base answers",
  accountTools: "Signed-in account tools",
  groundedCatalog: "Live domain and hosting catalog answers",
};

export function operatorFeatureLabel(key: OperatorFeatureKey): string {
  return FEATURE_LABELS[key];
}

let testOverride: OperatorFeatures | null = null;

export function setOperatorFeaturesForTests(
  value: OperatorFeatures | null,
): void {
  testOverride = value ? { ...value } : null;
}

export function parseOperatorFeatures(raw: unknown): OperatorFeatures {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const next = { ...DEFAULT_OPERATOR_FEATURES };
  for (const key of OPERATOR_FEATURE_KEYS) {
    if (typeof source[key] === "boolean") next[key] = source[key];
  }
  return next;
}

export async function readOperatorFeatures(): Promise<OperatorFeatures> {
  if (testOverride) return { ...testOverride };
  if (
    process.env.NODE_ENV === "test" &&
    process.env.INTEGRATION_TESTS !== "required"
  ) {
    return { ...DEFAULT_OPERATOR_FEATURES };
  }
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: BEYOND_MASTER_FEATURE_ROW_ID },
    });
    return parseOperatorFeatures(row?.data);
  } catch {
    return { ...DEFAULT_OPERATOR_FEATURES };
  }
}

export async function writeOperatorFeatures(
  patch: Partial<OperatorFeatures>,
): Promise<OperatorFeatures> {
  const current = await readOperatorFeatures();
  const next = parseOperatorFeatures({ ...current, ...patch });
  const data = next as Prisma.InputJsonValue;
  await prisma.siteSettings.upsert({
    where: { id: BEYOND_MASTER_FEATURE_ROW_ID },
    create: { id: BEYOND_MASTER_FEATURE_ROW_ID, data },
    update: { data },
  });
  return next;
}

export function commerceCapabilitySnapshot(
  env: Record<string, string | undefined> = process.env,
): {
  commerceEnabled: boolean;
  capabilities: {
    id: BeyondMasterCapability;
    envName: string;
    enabled: boolean;
  }[];
} {
  const ids: BeyondMasterCapability[] = [
    "domain_register",
    "domain_transfer",
    "domain_renew",
    "dns_write",
    "nameserver_update",
    "hosting_checkout",
    "email_provision",
    "wallet_topup",
  ];
  return {
    commerceEnabled: beyondMasterCommerceEnabled(env),
    capabilities: ids.map((id) => ({
      id,
      envName: capabilityEnvName(id),
      enabled: beyondMasterCapabilityEnabled(id, env),
    })),
  };
}
