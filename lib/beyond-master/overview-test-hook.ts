import type { OverviewFacts } from "@/lib/beyond-master/overview";

let factsOverride: (() => Promise<OverviewFacts>) | null = null;

export function setBeyondMasterOverviewFactsForTests(
  reader: (() => Promise<OverviewFacts>) | null,
) {
  if (process.env.NODE_ENV === "production") return;
  factsOverride = reader;
}

export function beyondMasterOverviewFactsOverride() {
  if (process.env.NODE_ENV === "production") return null;
  return factsOverride;
}
