import { Gift } from "lucide-react";

import type { CmsHostingPlan } from "@/lib/orbit/defaults";

export function formatAnnualCreditLine(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return value.toLowerCase().includes("free") ? value : `Free ${value}`;
}

/** Domain + Beyond AI credit — annual billing only. */
export function getAnnualPerkLines(
  plan: Pick<CmsHostingPlan, "domainPerk" | "annualCredit">,
  isAnnual: boolean,
): string[] {
  if (!isAnnual) return [];
  const lines: string[] = [];
  const domain = plan.domainPerk?.trim();
  if (domain) lines.push(domain);
  const credit = formatAnnualCreditLine(plan.annualCredit ?? "");
  if (credit) lines.push(credit);
  return lines;
}

export function filterPlanFeatures(
  features: string[],
  perkLines: string[],
): string[] {
  const perkKeys = new Set(perkLines.map((line) => line.toLowerCase()));
  return features.filter((feature) => {
    const value = feature.toLowerCase();
    if (perkKeys.has(value)) return false;
    return !(
      value.includes("beyond ai credit") ||
      value.includes("domain — free") ||
      value.includes("domain - free")
    );
  });
}

export function AnnualPlanPerks({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-[#e8e4ff] bg-[linear-gradient(180deg,#faf8ff_0%,#ffffff_100%)] px-3.5 py-3 shadow-[0_8px_20px_-16px_rgba(103,61,230,0.35)]"
      aria-label="Annual plan bonuses"
    >
      <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-[#673de6] uppercase">
        <Gift className="size-3.5 shrink-0" aria-hidden />
        Included with annual billing
      </p>
      <ul className="mt-2 space-y-1.5">
        {lines.map((line) => (
          <li
            key={line}
            className="text-[12.5px] leading-snug font-semibold text-[#1e1b4b]"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
