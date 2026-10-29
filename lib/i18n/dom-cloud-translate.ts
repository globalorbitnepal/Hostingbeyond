import { shouldSkipCloudTranslation } from "@/lib/integrations/translation/skip-policy";

export const TRANSLATE_ATTRS = [
  "placeholder",
  "aria-label",
  "title",
  "alt",
] as const;

export type TextLike = {
  nodeValue: string | null;
};

export type AttrLike = {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
};

const sourceByText = new WeakMap<object, string>();
const sourceByAttr = new WeakMap<object, Partial<Record<string, string>>>();

export function invertTranslationMap(
  map: Record<string, string>,
): Map<string, string> {
  const reverse = new Map<string, string>();
  for (const [original, translated] of Object.entries(map)) {
    if (translated && translated !== original)
      reverse.set(translated, original);
  }
  return reverse;
}

export function rememberTextSource(
  node: TextLike,
  currentMap: Record<string, string> = {},
): string {
  const existing = sourceByText.get(node);
  if (existing != null) return existing;
  const live = node.nodeValue ?? "";
  const original = invertTranslationMap(currentMap).get(live) ?? live;
  sourceByText.set(node, original);
  return original;
}

export function rememberAttrSource(
  el: AttrLike,
  name: string,
  currentMap: Record<string, string> = {},
): string {
  const bag = sourceByAttr.get(el) ?? {};
  const existing = bag[name];
  if (existing != null) return existing;
  const live = el.getAttribute(name) ?? "";
  const original = invertTranslationMap(currentMap).get(live) ?? live;
  bag[name] = original;
  sourceByAttr.set(el, bag);
  return original;
}

export function restoreTextSource(node: TextLike): void {
  const original = sourceByText.get(node);
  if (original != null) node.nodeValue = original;
}

export function restoreAttrSource(el: AttrLike, name: string): void {
  const original = sourceByAttr.get(el)?.[name];
  if (original != null) el.setAttribute(name, original);
}

export function applyTextMap(
  nodes: readonly TextLike[],
  map: Record<string, string>,
): { applied: number; skipped: number } {
  let applied = 0;
  let skipped = 0;
  for (const node of nodes) {
    const original = rememberTextSource(node, map);
    const next = map[original];
    if (!next || next === original || shouldSkipCloudTranslation(original)) {
      if (node.nodeValue !== original) node.nodeValue = original;
      skipped += 1;
      continue;
    }
    if (node.nodeValue !== next) node.nodeValue = next;
    applied += 1;
  }
  return { applied, skipped };
}

export function applyAttrMap(
  els: readonly AttrLike[],
  name: (typeof TRANSLATE_ATTRS)[number],
  map: Record<string, string>,
): { applied: number; skipped: number } {
  let applied = 0;
  let skipped = 0;
  for (const el of els) {
    const original = rememberAttrSource(el, name, map);
    if (!original) continue;
    const next = map[original];
    if (!next || next === original || shouldSkipCloudTranslation(original)) {
      if (el.getAttribute(name) !== original) el.setAttribute(name, original);
      skipped += 1;
      continue;
    }
    if (el.getAttribute(name) !== next) el.setAttribute(name, next);
    applied += 1;
  }
  return { applied, skipped };
}

export function shouldAcceptTranslationResult(input: {
  runId: number;
  currentRunId: number;
  requestedLanguage: string;
  selectedLanguage: string;
}): boolean {
  return (
    input.runId === input.currentRunId &&
    input.requestedLanguage === input.selectedLanguage
  );
}

export function textsNeedingTranslation(
  originals: readonly string[],
  map: Record<string, string>,
): string[] {
  return [
    ...new Set(
      originals.filter(
        (text) =>
          text.trim().length >= 2 &&
          map[text] == null &&
          !shouldSkipCloudTranslation(text),
      ),
    ),
  ];
}
