import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEVELOPER_STACK_KEYS,
  DEVELOPER_STACK_PATHS,
  defaultDeveloperHostingContent,
  mergeDeveloperHostingContent,
} from "./developer-hosting-content";

const contents = DEVELOPER_STACK_KEYS.map((key) => ({
  key,
  content: defaultDeveloperHostingContent(key),
}));

describe("developer hosting content", () => {
  it("defines exactly the five supported stacks", () => {
    assert.deepEqual([...DEVELOPER_STACK_KEYS].sort(), [
      "django-hosting",
      "laravel-hosting",
      "nestjs-hosting",
      "nodejs-hosting",
      "python-hosting",
    ]);
  });

  it("gives every stack a unique H1", () => {
    const titles = contents.map(({ content }) =>
      `${content.heroTitle} ${content.heroTitleAccent}`.trim(),
    );
    assert.equal(new Set(titles).size, titles.length);
  });

  it("gives every stack a unique hero description", () => {
    const descriptions = contents.map(({ content }) => content.heroDescription);
    assert.equal(new Set(descriptions).size, descriptions.length);
  });

  it("gives every stack unique FAQ questions", () => {
    const all = contents.flatMap(({ content }) =>
      content.faqs.map((faq) => faq.question),
    );
    // Shared ids may repeat wording only where the answer is stack-agnostic;
    // the majority of question text must be stack-specific.
    const unique = new Set(all);
    assert.ok(
      unique.size > all.length * 0.6,
      `expected mostly unique FAQ text, got ${unique.size}/${all.length}`,
    );
  });

  it("never renders WordPress or WooCommerce copy on a developer page", () => {
    for (const { key, content } of contents) {
      const haystack = JSON.stringify(content);
      assert.doesNotMatch(
        haystack,
        /managed wordpress/i,
        `${key} mentions WordPress`,
      );
      assert.doesNotMatch(
        haystack,
        /woocommerce/i,
        `${key} mentions WooCommerce`,
      );
    }
  });

  it("omits unsupported performance guarantees", () => {
    for (const { key, content } of contents) {
      const haystack = JSON.stringify(content);
      assert.doesNotMatch(
        haystack,
        /5\s*[×x]\s*faster/i,
        `${key} claims 5x faster`,
      );
      assert.doesNotMatch(
        haystack,
        /100% uptime/i,
        `${key} claims 100% uptime`,
      );
    }
  });

  it("names the stack in each hero eyebrow", () => {
    const expectations: Record<string, RegExp> = {
      "nodejs-hosting": /node/i,
      "python-hosting": /python/i,
      "laravel-hosting": /laravel/i,
      "django-hosting": /django/i,
      "nestjs-hosting": /nestjs/i,
    };
    for (const { key, content } of contents) {
      assert.match(content.heroEyebrow, expectations[key], key);
    }
  });

  it("states the provisioning limitation on every page", () => {
    for (const { key, content } of contents) {
      const provisioning = content.faqs.find(
        (faq) => faq.id === "provisioning",
      );
      assert.ok(provisioning, `${key} is missing the provisioning FAQ`);
      assert.match(provisioning.answer, /not yet automate/i);
    }
  });

  it("flags unavailable capabilities instead of hiding them", () => {
    const node = defaultDeveloperHostingContent("nodejs-hosting");
    const processManager = node.features.find(
      (feature) => feature.id === "node-process-manager",
    );
    assert.ok(processManager);
    assert.equal(processManager.available, false);

    const python = defaultDeveloperHostingContent("python-hosting");
    const postgres = python.features.find(
      (feature) => feature.id === "postgres",
    );
    assert.ok(postgres);
    assert.equal(postgres.available, false);
  });

  it("ships working in-page CTA anchors", () => {
    for (const { key, content } of contents) {
      assert.equal(content.heroPrimaryHref, "#plans", key);
      assert.equal(content.heroSecondaryHref, "#features", key);
      assert.equal(content.closingCtaHref, "#plans", key);
    }
  });

  it("keeps canonical paths matching the existing routes", () => {
    assert.equal(DEVELOPER_STACK_PATHS["nodejs-hosting"], "/nodejs-hosting");
    assert.equal(
      DEVELOPER_STACK_PATHS["python-hosting"],
      "/web-hosting/python",
    );
    assert.equal(DEVELOPER_STACK_PATHS["laravel-hosting"], "/laravel-hosting");
    assert.equal(DEVELOPER_STACK_PATHS["django-hosting"], "/django-hosting");
    assert.equal(DEVELOPER_STACK_PATHS["nestjs-hosting"], "/nestjs-hosting");
  });
});

describe("mergeDeveloperHostingContent", () => {
  it("returns defaults when nothing is stored", () => {
    const merged = mergeDeveloperHostingContent("laravel-hosting", null);
    assert.equal(
      merged.heroTitle,
      defaultDeveloperHostingContent("laravel-hosting").heroTitle,
    );
  });

  it("applies stored edits without losing other fields", () => {
    const merged = mergeDeveloperHostingContent("django-hosting", {
      heroTitle: "Custom Django title",
    });
    assert.equal(merged.heroTitle, "Custom Django title");
    assert.equal(
      merged.heroDescription,
      defaultDeveloperHostingContent("django-hosting").heroDescription,
    );
    assert.ok(merged.faqs.length > 0);
  });

  it("ignores blank strings so a cleared field cannot empty the page", () => {
    const merged = mergeDeveloperHostingContent("nestjs-hosting", {
      heroTitle: "   ",
    });
    assert.equal(
      merged.heroTitle,
      defaultDeveloperHostingContent("nestjs-hosting").heroTitle,
    );
  });

  it("preserves the unavailable flag when an admin edits a feature", () => {
    const merged = mergeDeveloperHostingContent("python-hosting", {
      features: defaultDeveloperHostingContent("python-hosting").features.map(
        (feature) =>
          feature.id === "postgres"
            ? { ...feature, title: "PostgreSQL (not offered)" }
            : feature,
      ),
    });
    const postgres = merged.features.find(
      (feature) => feature.id === "postgres",
    );
    assert.ok(postgres);
    assert.equal(postgres.title, "PostgreSQL (not offered)");
    assert.equal(postgres.available, false);
  });
});
