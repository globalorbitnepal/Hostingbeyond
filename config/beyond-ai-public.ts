import type { NavItem } from "@/config/navigation";
import { routes } from "@/config/routes";

/** Public Beyond AI (nav, pricing tab, /beyond-ai, dashboard builder) — flip when launching. */
export const BEYOND_AI_PUBLIC_ENABLED = false;

export function isBeyondAiPublicPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return path === routes.beyondAi || path.startsWith(`${routes.beyondAi}/`);
}

export function filterNavBeyondAi(items: NavItem[]): NavItem[] {
  if (BEYOND_AI_PUBLIC_ENABLED) return items;
  return items.filter(
    (item) =>
      item.label !== "Beyond AI" &&
      item.href !== routes.beyondAi &&
      !item.href.startsWith(`${routes.beyondAi}/`),
  );
}

export function textMentionsBeyondAi(value: string): boolean {
  return /beyond\s*ai/i.test(value);
}
