export const BEYOND_MASTER_KNOWLEDGE_CATEGORIES = [
  "domain-management",
  "domain-registration",
  "dns",
  "shared-hosting",
  "developer-hosting",
  "vps",
  "nodejs",
  "git-deployment",
  "ssl",
  "business-email",
  "troubleshooting",
  "billing",
  "support",
] as const;

export type BeyondMasterKnowledgeCategory =
  (typeof BEYOND_MASTER_KNOWLEDGE_CATEGORIES)[number];

export function isBeyondMasterKnowledgeCategory(
  value: string,
): value is BeyondMasterKnowledgeCategory {
  return (BEYOND_MASTER_KNOWLEDGE_CATEGORIES as readonly string[]).includes(
    value,
  );
}
