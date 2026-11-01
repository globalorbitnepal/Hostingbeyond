"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/locale/locale-provider";
import {
  GOOGLE_PAGE_LANGUAGE,
  clearGoogtransCookie,
  isGoogleTranslationActive,
} from "@/lib/i18n/google-translate-client";
import {
  TRANSLATE_ATTRS,
  applyAttrMap,
  applyTextMap,
  rememberAttrSource,
  rememberTextSource,
  restoreAttrSource,
  restoreTextSource,
  shouldAcceptTranslationResult,
  textsNeedingTranslation,
} from "@/lib/i18n/dom-cloud-translate";
import { shouldSkipCloudTranslation } from "@/lib/integrations/translation/skip-policy";
import { PUBLIC_ENGLISH_ONLY } from "@/lib/i18n/public-language";
import { shouldUseCloudDomTranslation } from "@/lib/i18n/storefront-translation";
import type { WebsiteLanguageCode } from "@/lib/i18n/website-languages";

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "KBD",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "SVG",
  "CANVAS",
]);

type Status = "idle" | "unavailable" | "translating" | "partial" | "ready";

function cacheKey(lang: string) {
  return `hb_gct_v1_${lang}`;
}

function readCache(lang: string): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(cacheKey(lang));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(lang: string, map: Record<string, string>) {
  try {
    sessionStorage.setItem(cacheKey(lang), JSON.stringify(map));
  } catch {
    /* quota */
  }
}

function isProtectedNode(node: Node): boolean {
  let current: Node | null =
    node instanceof HTMLElement ? node : node.parentElement;
  while (current && current instanceof HTMLElement) {
    if (SKIP_TAGS.has(current.tagName)) return true;
    if (current.getAttribute("translate") === "no") return true;
    if (current.classList.contains("notranslate")) return true;
    if (current.hasAttribute("data-hb-no-translate")) return true;
    current = current.parentElement;
  }
  return false;
}

function collectTextNodes(
  root: HTMLElement,
  map: Record<string, string>,
): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    if (current instanceof Text) {
      const value = rememberTextSource(current, map);
      if (
        value.trim().length >= 2 &&
        !isProtectedNode(current) &&
        !shouldSkipCloudTranslation(value)
      ) {
        nodes.push(current);
      }
    }
    current = walker.nextNode();
  }
  return nodes;
}

function collectAttrTargets(
  root: HTMLElement,
  map: Record<string, string>,
): Array<{ el: HTMLElement; name: (typeof TRANSLATE_ATTRS)[number] }> {
  const out: Array<{
    el: HTMLElement;
    name: (typeof TRANSLATE_ATTRS)[number];
  }> = [];
  for (const name of TRANSLATE_ATTRS) {
    for (const el of root.querySelectorAll<HTMLElement>(`[${name}]`)) {
      if (isProtectedNode(el)) continue;
      const original = rememberAttrSource(el, name, map);
      if (original.trim().length < 2 || shouldSkipCloudTranslation(original)) {
        continue;
      }
      out.push({ el, name });
    }
  }
  return out;
}

async function fetchOneBatch(
  chunk: string[],
  targetLanguage: string,
  signal: AbortSignal,
): Promise<{
  map: Record<string, string>;
  ok: boolean;
  configured: boolean;
}> {
  const map: Record<string, string> = {};
  const res = await fetch("/api/i18n/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ targetLanguage, texts: chunk }),
    credentials: "same-origin",
    signal,
  });
  if (res.status === 503) return { map, ok: false, configured: false };
  if (!res.ok) return { map, ok: false, configured: true };
  const json = (await res.json()) as {
    items?: { original: string; translated: string; skipped: boolean }[];
  };
  for (const item of json.items ?? []) {
    map[item.original] = item.skipped ? item.original : item.translated;
  }
  return { map, ok: true, configured: true };
}

/**
 * Translate in parallel batches so a full page resolves in one round of
 * requests instead of a serial chain.
 */
async function fetchBatches(
  texts: string[],
  targetLanguage: string,
  signal: AbortSignal,
): Promise<{
  map: Record<string, string>;
  ok: boolean;
  configured: boolean;
}> {
  const map: Record<string, string> = {};
  const unique = [...new Set(texts)];
  const chunkSize = 40;
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += chunkSize) {
    chunks.push(unique.slice(i, i + chunkSize));
  }
  const concurrency = 4;
  for (let start = 0; start < chunks.length; start += concurrency) {
    if (signal.aborted) return { map, ok: false, configured: true };
    const slice = chunks.slice(start, start + concurrency);
    const results = await Promise.all(
      slice.map((chunk) => fetchOneBatch(chunk, targetLanguage, signal)),
    );
    for (const result of results) {
      if (!result.configured) return { map, ok: false, configured: false };
      if (!result.ok) return { map, ok: false, configured: true };
      Object.assign(map, result.map);
    }
  }
  return { map, ok: true, configured: true };
}

export function CloudTranslateRuntime({
  onUnavailable,
}: {
  onUnavailable?: () => void;
} = {}) {
  const { preferences, enabledLanguageCodes } = useLocale();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("idle");
  const generation = useRef(0);
  const applying = useRef(false);
  const target = preferences.googleTargetLang ?? GOOGLE_PAGE_LANGUAGE;
  const languageAllowed = enabledLanguageCodes.includes(
    target as WebsiteLanguageCode,
  );
  const disabled =
    PUBLIC_ENGLISH_ONLY ||
    pathname.startsWith("/orbit") ||
    pathname.startsWith("/api/orbit") ||
    !languageAllowed;

  useEffect(() => {
    if (isGoogleTranslationActive(target)) {
      clearGoogtransCookie();
    }
  }, [target]);

  useEffect(() => {
    const root = document.getElementById("hb-translate-root");

    const restoreAll = () => {
      if (!root) return;
      const empty = {};
      applying.current = true;
      for (const node of collectTextNodes(root, empty)) restoreTextSource(node);
      for (const { el, name } of collectAttrTargets(root, empty)) {
        restoreAttrSource(el, name);
      }
      applying.current = false;
    };

    if (disabled || !shouldUseCloudDomTranslation(target)) {
      restoreAll();
      setStatus("idle");
      return;
    }

    const runId = ++generation.current;
    const controller = new AbortController();
    let cancelled = false;
    let debounce: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      if (
        !shouldAcceptTranslationResult({
          runId,
          currentRunId: generation.current,
          requestedLanguage: target,
          selectedLanguage: preferences.googleTargetLang,
        })
      ) {
        return;
      }

      if (!root) {
        setStatus("partial");
        return;
      }

      /** Cached strings paint instantly, before any network call. */
      const cached = readCache(target);
      const nodes = collectTextNodes(root, cached);
      const attrs = collectAttrTargets(root, cached);
      const originals = [
        ...nodes.map((node) => rememberTextSource(node, cached)),
        ...attrs.map(({ el, name }) => rememberAttrSource(el, name, cached)),
      ];
      const missing = textsNeedingTranslation(originals, cached);
      if (missing.length === 0) {
        applying.current = true;
        const textResult = applyTextMap(nodes, cached);
        let attrSkipped = 0;
        for (const name of TRANSLATE_ATTRS) {
          const group = attrs
            .filter((row) => row.name === name)
            .map((row) => row.el);
          const result = applyAttrMap(group, name, cached);
          attrSkipped += result.skipped;
        }
        applying.current = false;
        setStatus(textResult.skipped + attrSkipped > 0 ? "partial" : "ready");
        return;
      }

      setStatus("translating");
      const fetched = await fetchBatches(missing, target, controller.signal);
      if (cancelled || runId !== generation.current) return;
      if (!fetched.configured) {
        restoreAll();
        setStatus("unavailable");
        onUnavailable?.();
        return;
      }
      if (!fetched.ok) {
        restoreAll();
        setStatus("partial");
        return;
      }
      Object.assign(cached, fetched.map);
      writeCache(target, cached);

      applying.current = true;
      const textResult = applyTextMap(nodes, cached);
      let attrApplied = 0;
      let attrSkipped = 0;
      for (const name of TRANSLATE_ATTRS) {
        const group = attrs
          .filter((row) => row.name === name)
          .map((row) => row.el);
        const result = applyAttrMap(group, name, cached);
        attrApplied += result.applied;
        attrSkipped += result.skipped;
      }
      applying.current = false;
      const applied = textResult.applied + attrApplied;
      const skipped = textResult.skipped + attrSkipped;
      if (applied === 0) setStatus("partial");
      else if (skipped > 0) setStatus("partial");
      else setStatus("ready");
    };

    void run();

    const observer =
      root && typeof MutationObserver !== "undefined"
        ? new MutationObserver(() => {
            if (applying.current || cancelled) return;
            if (debounce) clearTimeout(debounce);
            debounce = setTimeout(() => {
              if (cancelled || runId !== generation.current) return;
              void run();
            }, 120);
          })
        : null;
    observer?.observe(root!, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATE_ATTRS],
    });

    return () => {
      cancelled = true;
      controller.abort();
      observer?.disconnect();
      if (debounce) clearTimeout(debounce);
    };
  }, [disabled, onUnavailable, pathname, preferences.googleTargetLang, target]);

  const warmup = useMemo(() => {
    if (disabled || !shouldUseCloudDomTranslation(target)) return null;
    return target;
  }, [disabled, target]);

  useEffect(() => {
    if (!warmup) return;
    /** Prefetch a small bundle so the first paint after switching is instant. */
    const controller = new AbortController();
    void fetch("/api/i18n/translate", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    }).catch(() => undefined);
    return () => controller.abort();
  }, [warmup]);

  void status;
  return null;
}
