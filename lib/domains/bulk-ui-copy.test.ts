import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";

import {
  defaultDomainContent,
  mergeDomainContent,
  sanitizeBulkPageCopy,
} from "@/lib/domains/content";
import { MAX_BULK_DOMAIN_SEARCH } from "@/lib/domains/bulk-search-limit";

const STALE_BULK_FIFTY =
  /\b50\s*names?\s*per\s*run\b|0\/50\b|up to 50 domain|check 50 domain|fifty completely different names/i;

describe("bulk domain search UI copy", () => {
  it("default CMS bulk content advertises 10 not 50", () => {
    const bulk = defaultDomainContent().bulk;
    const blob = JSON.stringify(bulk);
    assert.equal(STALE_BULK_FIFTY.test(blob), false);
    assert.match(bulk.title, /bulk domain search/i);
    assert.match(bulk.seoDescription, /10 domain/i);
    assert.equal(bulk.stats.find((s) => s.id === "names")?.value, "10");
  });

  it("domain search panel source uses shared bulk limit constant", () => {
    const panelPath = path.join(
      process.cwd(),
      "components/domains/domain-search-panel.tsx",
    );
    const src = readFileSync(panelPath, "utf8");
    assert.match(src, /MAX_BULK_DOMAIN_SEARCH/);
    assert.match(src, /\{countBulkLines\(bulk\)\}\/\{BULK_LIMIT\}/);
    assert.equal(STALE_BULK_FIFTY.test(src), false);
  });

  it("sanitizeBulkPageCopy replaces stale Orbit SEO mentioning 50 domains", () => {
    const defaults = defaultDomainContent();
    const stale = {
      ...defaults.bulk,
      seoTitle: "Bulk Domain Search — Check 50 Domain Names at Once",
      seoDescription: "Check up to 50 domain names at once",
      stats: defaults.bulk.stats.map((s) =>
        s.id === "names" ? { ...s, value: "50" } : s,
      ),
    };
    const clean = sanitizeBulkPageCopy(stale, defaults.bulk);
    assert.equal(STALE_BULK_FIFTY.test(clean.seoTitle), false);
    assert.equal(STALE_BULK_FIFTY.test(clean.seoDescription), false);
    assert.equal(clean.stats.find((s) => s.id === "names")?.value, "10");
  });

  it("mergeDomainContent sanitizes stored bulk CMS overrides", () => {
    const defaults = defaultDomainContent();
    const merged = mergeDomainContent({
      bulk: {
        seoTitle: "Bulk Domain Search — Check 50 Domain Names at Once",
      } as import("@/lib/domains/content").DomainPageCopy,
    });
    assert.equal(STALE_BULK_FIFTY.test(merged.bulk.seoTitle), false);
    assert.match(merged.bulk.seoTitle, /10/i);
  });

  it("bulk-input defaults align with MAX_BULK_DOMAIN_SEARCH", () => {
    const inputPath = path.join(process.cwd(), "lib/domains/bulk-input.ts");
    const src = readFileSync(inputPath, "utf8");
    assert.match(src, /limit = MAX_BULK_DOMAIN_SEARCH/);
    assert.equal(MAX_BULK_DOMAIN_SEARCH, 10);
  });
});
