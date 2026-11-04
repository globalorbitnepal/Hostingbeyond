import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { BEYOND_MASTER_BUILTIN_ARTICLES } from "@/lib/beyond-master/knowledge/articles";
import {
  adminCreateKnowledge,
  adminGetKnowledge,
  adminListKnowledge,
  adminUpdateKnowledge,
  createMemoryKnowledgeRepository,
  previewKnowledgeArticle,
  setBeyondMasterKnowledgeRepositoryForTests,
  type KnowledgeArticleInput,
} from "@/lib/beyond-master/knowledge/manage";
import {
  mergeKnowledgeArticles,
  retrieveBeyondMasterKnowledge,
} from "@/lib/beyond-master/knowledge/retrieve";

const article = {
  title: "Mailbox setup",
  slug: "mailbox-setup",
  category: "business-email" as const,
  body: "Customers connect mail from the email service panel. This article does not invent a mail host.",
  keywords: ["mailbox setup"],
  sourceNote: "Checked against the product page.",
  published: false,
};

afterEach(() => {
  setBeyondMasterKnowledgeRepositoryForTests(null);
});

function jsonRequest(url: string, body?: unknown, method = "POST") {
  return new Request(url, {
    method: body === undefined ? "GET" : method,
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("beyond master knowledge management", () => {
  it("rejects an anonymous admin before the repository is called", async () => {
    let called = false;
    const memory = createMemoryKnowledgeRepository();
    setBeyondMasterKnowledgeRepositoryForTests({
      ...memory,
      list: async () => {
        called = true;
        throw new Error("database should not be touched");
      },
    });
    const denied = await adminListKnowledge(
      null,
      new Request("http://localhost/api/orbit/beyond-master/knowledge"),
    );
    assert.equal(denied.status, 401);
    assert.equal(called, false);
  });

  it("reports a missing migration without counts", async () => {
    const memory = createMemoryKnowledgeRepository();
    setBeyondMasterKnowledgeRepositoryForTests({
      ...memory,
      list: async () => ({
        ok: false,
        status: 503,
        code: "migration_pending",
        error:
          "Knowledge base management is unavailable until the database migration is applied.",
      }),
    });
    const response = await adminListKnowledge(
      "admin-1",
      new Request("http://localhost/api/orbit/beyond-master/knowledge"),
    );
    const body = (await response.json()) as {
      available: boolean;
      message: string;
      counts?: unknown;
      builtins: unknown[];
    };
    assert.equal(body.available, false);
    assert.equal(
      body.message,
      "Knowledge base management is unavailable until the database migration is applied.",
    );
    assert.equal("counts" in body, false);
    assert.equal(body.builtins.length, BEYOND_MASTER_BUILTIN_ARTICLES.length);
  });

  it("creates, lists, edits, publishes, and rejects invalid articles", async () => {
    const memory = createMemoryKnowledgeRepository();
    setBeyondMasterKnowledgeRepositoryForTests(memory);
    const short = await adminCreateKnowledge(
      "admin-1",
      jsonRequest("http://localhost/create", { ...article, body: "Too short" }),
    );
    assert.equal(short.status, 400);
    const missing = await adminCreateKnowledge(
      "admin-1",
      jsonRequest("http://localhost/create", { title: "Hi" }),
    );
    assert.equal(missing.status, 400);
    const badCategory = await adminCreateKnowledge(
      "admin-1",
      jsonRequest("http://localhost/create", {
        ...article,
        category: "secrets",
      }),
    );
    assert.equal(badCategory.status, 400);
    const script = await adminCreateKnowledge(
      "admin-1",
      jsonRequest("http://localhost/create", {
        ...article,
        title: "Script note",
        slug: "script-note",
        body: "<script>alert(1)</script>Customers connect mail from the email service panel.",
      }),
    );
    const scriptBody = (await script.json()) as { article: { body: string } };
    assert.equal(script.status, 201);
    assert.equal(scriptBody.article.body.includes("<script"), false);
    assert.equal(scriptBody.article.body.includes("alert(1)"), false);
    assert.match(scriptBody.article.body, /Customers connect mail/);

    const created = await adminCreateKnowledge(
      "admin-1",
      jsonRequest("http://localhost/create", article),
    );
    assert.equal(created.status, 201);
    const stored = (await created.json()) as {
      article: KnowledgeArticleInput & { id: string; published: boolean };
    };
    assert.equal(stored.article.published, false);
    const duplicate = await adminCreateKnowledge(
      "admin-1",
      jsonRequest("http://localhost/create", article),
    );
    assert.equal(duplicate.status, 409);

    const listed = await adminListKnowledge(
      "admin-1",
      new Request(
        "http://localhost/api/orbit/beyond-master/knowledge?q=mailbox&category=business-email&published=false",
      ),
    );
    const queue = (await listed.json()) as {
      counts: { total: number; published: number; unpublished: number };
      articles: { id: string; slug: string }[];
      total: number;
    };
    assert.equal(queue.total, 1);
    assert.equal(queue.articles[0]?.slug, "mailbox-setup");
    assert.equal(queue.counts.unpublished >= 1, true);

    const edited = await adminUpdateKnowledge(
      "admin-1",
      stored.article.id,
      jsonRequest(
        "http://localhost/patch",
        { ...article, title: "Mailbox setup guide", published: true },
        "PATCH",
      ),
    );
    const updated = (await edited.json()) as {
      article: { title: string; published: boolean; slug: string };
    };
    assert.equal(edited.status, 200);
    assert.equal(updated.article.title, "Mailbox setup guide");
    assert.equal(updated.article.published, true);
    assert.equal(updated.article.slug, "mailbox-setup");

    const unpublished = await adminUpdateKnowledge(
      "admin-1",
      stored.article.id,
      jsonRequest(
        "http://localhost/patch",
        { ...article, title: "Mailbox setup guide", published: false },
        "PATCH",
      ),
    );
    assert.equal(
      ((await unpublished.json()) as { article: { published: boolean } })
        .article.published,
      false,
    );

    const detail = await adminGetKnowledge("admin-1", stored.article.id);
    assert.equal(detail.status, 200);
    const missingId = await adminGetKnowledge("admin-1", "missing1");
    assert.equal(missingId.status, 404);
  });

  it("keeps unpublished articles out of retrieval and published articles in it", async () => {
    const hidden = {
      slug: "mailbox-setup",
      category: "business-email" as const,
      title: "Hidden mailbox",
      body: "Do not retrieve this unpublished mailbox article.",
      keywords: ["mailbox setup"],
      published: false,
      source: "database" as const,
    };
    const mergedHidden = mergeKnowledgeArticles([hidden]);
    const hiddenResult = retrieveBeyondMasterKnowledge(
      "mailbox setup",
      mergedHidden,
    );
    assert.equal(
      JSON.stringify(hiddenResult).includes("Do not retrieve"),
      false,
    );

    const visible = {
      ...hidden,
      published: true,
      body: "Customers connect mail from the email service panel.",
    };
    const mergedVisible = mergeKnowledgeArticles([visible]);
    const visibleResult = retrieveBeyondMasterKnowledge(
      "mailbox setup",
      mergedVisible,
    );
    assert.equal(
      visibleResult.articles.some((item) => item.slug === "mailbox-setup"),
      true,
    );
    assert.equal(
      mergedVisible.some((item) => item.category === "dns"),
      true,
    );

    const fallback = retrieveBeyondMasterKnowledge(
      "How do I add an MX record and SPF TXT?",
    );
    assert.equal(fallback.articles[0]?.category, "dns");
  });

  it("previews an article without saving or publishing it", async () => {
    let called = false;
    setBeyondMasterKnowledgeRepositoryForTests({
      ...createMemoryKnowledgeRepository(),
      create: async () => {
        called = true;
        throw new Error("preview must not save");
      },
    });
    const preview = previewKnowledgeArticle({ ...article, published: false });
    assert.equal(preview.saved, false);
    assert.equal(preview.published, false);
    assert.equal(preview.title, article.title);
    assert.equal(called, false);
  });
});
