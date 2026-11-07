import { Prisma } from "@prisma/client";

import { BEYOND_MASTER_BUILTIN_ARTICLES } from "@/lib/beyond-master/knowledge/articles";
import {
  BEYOND_MASTER_KNOWLEDGE_CATEGORIES,
  isBeyondMasterKnowledgeCategory,
  type BeyondMasterKnowledgeCategory,
} from "@/lib/beyond-master/knowledge/categories";
import { sanitizeKnowledgeText } from "@/lib/beyond-master/knowledge/sanitize";
import { invalidateBeyondMasterKnowledgeCache } from "@/lib/beyond-master/knowledge/build";
import { prisma } from "@/lib/prisma";

export const KNOWLEDGE_MIGRATION_MESSAGE =
  "Knowledge base management is unavailable until the database migration is applied.";

export type KnowledgeArticleInput = {
  slug: string;
  category: BeyondMasterKnowledgeCategory;
  title: string;
  body: string;
  keywords: string[];
  published: boolean;
  sourceNote: string;
};

export type KnowledgeAdminArticle = KnowledgeArticleInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeBuiltinArticle = {
  slug: string;
  category: string;
  title: string;
  body: string;
  published: boolean;
  source: "builtin";
};

export type KnowledgeCounts = {
  total: number;
  published: number;
  unpublished: number;
  categories: number;
};

export type KnowledgeListQuery = {
  query: string;
  category: BeyondMasterKnowledgeCategory | null;
  published: boolean | null;
  page: number;
  pageSize: number;
};

export type KnowledgeFailure = {
  ok: false;
  status: number;
  code: string;
  error: string;
};

export type KnowledgeRepository = {
  list(input: KnowledgeListQuery): Promise<
    | {
        ok: true;
        counts: KnowledgeCounts;
        articles: KnowledgeAdminArticle[];
        total: number;
        page: number;
        pageSize: number;
      }
    | KnowledgeFailure
  >;
  get(id: string): Promise<KnowledgeAdminArticle | null | KnowledgeFailure>;
  create(
    input: KnowledgeArticleInput,
    now: Date,
  ): Promise<{ ok: true; article: KnowledgeAdminArticle } | KnowledgeFailure>;
  update(
    id: string,
    input: KnowledgeArticleInput,
    now: Date,
  ): Promise<{ ok: true; article: KnowledgeAdminArticle } | KnowledgeFailure>;
};

let repositoryOverride: KnowledgeRepository | null = null;

export function setBeyondMasterKnowledgeRepositoryForTests(
  repository: KnowledgeRepository | null,
) {
  if (process.env.NODE_ENV === "production") return;
  repositoryOverride = repository;
}

export function getBeyondMasterKnowledgeRepository(): KnowledgeRepository {
  if (process.env.NODE_ENV !== "production" && repositoryOverride)
    return repositoryOverride;
  return prismaKnowledgeRepository;
}

export function builtinKnowledgeArticles(): KnowledgeBuiltinArticle[] {
  return BEYOND_MASTER_BUILTIN_ARTICLES.map((article) => ({
    slug: article.slug,
    category: article.category,
    title: article.title,
    body: article.body,
    published: article.published,
    source: "builtin" as const,
  }));
}

export function previewKnowledgeArticle(input: KnowledgeArticleInput) {
  return {
    title: input.title,
    category: input.category,
    body: input.body,
    keywords: input.keywords,
    sourceNote: input.sourceNote,
    published: input.published,
    saved: false as const,
  };
}

export function parseKnowledgeArticle(
  payload: unknown,
): { ok: true; value: KnowledgeArticleInput } | { ok: false; error: string } {
  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  if (!body) return { ok: false, error: "Send a valid article." };
  const title = sanitizeKnowledgeText(
    typeof body.title === "string" ? body.title : "",
  );
  if (title.length < 3 || title.length > 160)
    return { ok: false, error: "Add a title." };
  const slug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!/^[a-z0-9-]{3,80}$/.test(slug))
    return {
      ok: false,
      error: "Use a slug of lowercase letters, numbers, and hyphens.",
    };
  const category = typeof body.category === "string" ? body.category : "";
  if (!isBeyondMasterKnowledgeCategory(category))
    return { ok: false, error: "Choose a category." };
  const content = sanitizeKnowledgeText(
    typeof body.body === "string" ? body.body : "",
  );
  if (content.length < 10)
    return { ok: false, error: "Write the article content." };
  const keywords = keywordsOf(body.keywords, title);
  const sourceNote = sanitizeKnowledgeText(
    typeof body.sourceNote === "string" ? body.sourceNote : "",
  ).slice(0, 500);
  const published = body.published === true;
  return {
    ok: true,
    value: {
      slug,
      category,
      title,
      body: content,
      keywords,
      published,
      sourceNote,
    },
  };
}

export function parseKnowledgeListQuery(
  url: URL,
): { ok: true; value: KnowledgeListQuery } | { ok: false; error: string } {
  const rawCategory = url.searchParams.get("category");
  const category =
    rawCategory && isBeyondMasterKnowledgeCategory(rawCategory)
      ? rawCategory
      : null;
  if (rawCategory && !category)
    return { ok: false, error: "Choose a category." };
  const rawPublished = url.searchParams.get("published");
  let published: boolean | null = null;
  if (rawPublished === "true") published = true;
  else if (rawPublished === "false") published = false;
  else if (rawPublished) return { ok: false, error: "Choose a status." };
  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  if (!Number.isInteger(page) || page < 1 || page > 100)
    return { ok: false, error: "Choose a page." };
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50)
    return { ok: false, error: "Page size must be 50 or fewer." };
  return {
    ok: true,
    value: {
      query: (url.searchParams.get("q") ?? "").slice(0, 120),
      category,
      published,
      page,
      pageSize,
    },
  };
}

export function createMemoryKnowledgeRepository(): KnowledgeRepository {
  const articles: KnowledgeAdminArticle[] = [];
  let sequence = 0;
  return {
    async list(input) {
      const filtered = filterArticles(articles, input);
      const start = (input.page - 1) * input.pageSize;
      return {
        ok: true,
        counts: countsOf(articles),
        articles: filtered.slice(start, start + input.pageSize),
        total: filtered.length,
        page: input.page,
        pageSize: input.pageSize,
      };
    },
    async get(id) {
      return articles.find((article) => article.id === id) ?? null;
    },
    async create(input, now) {
      if (articles.some((article) => article.slug === input.slug)) {
        return {
          ok: false,
          status: 409,
          code: "duplicate_slug",
          error: "That slug is already used.",
        };
      }
      sequence += 1;
      const article: KnowledgeAdminArticle = {
        ...input,
        id: `karticle${String(sequence).padStart(4, "0")}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      articles.push(article);
      return { ok: true, article };
    },
    async update(id, input, now) {
      const current = articles.find((article) => article.id === id);
      if (!current)
        return {
          ok: false,
          status: 404,
          code: "not_found",
          error: "That article was not found.",
        };
      if (
        articles.some(
          (article) => article.slug === input.slug && article.id !== id,
        )
      ) {
        return {
          ok: false,
          status: 409,
          code: "duplicate_slug",
          error: "That slug is already used.",
        };
      }
      Object.assign(current, input, { updatedAt: now.toISOString() });
      return { ok: true, article: current };
    },
  };
}

export async function adminListKnowledge(
  adminId: string | null,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = parseKnowledgeListQuery(new URL(request.url));
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const result = await getBeyondMasterKnowledgeRepository().list(parsed.value);
  const builtins = filterBuiltins(parsed.value);
  if (!result.ok) {
    if (result.code === "migration_pending") {
      return Response.json({
        available: false,
        message: result.error,
        builtins,
      });
    }
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({
    available: true,
    counts: result.counts,
    articles: result.articles,
    builtins,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    categories: BEYOND_MASTER_KNOWLEDGE_CATEGORIES,
  });
}

export async function adminGetKnowledge(adminId: string | null, id: string) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^[-a-zA-Z0-9_]{6,40}$/.test(id)) {
    return Response.json(
      { error: "That article was not found." },
      { status: 404 },
    );
  }
  const article = await getBeyondMasterKnowledgeRepository().get(id);
  if (article && "ok" in article && article.ok === false) {
    return Response.json({ error: article.error }, { status: article.status });
  }
  if (!article)
    return Response.json(
      { error: "That article was not found." },
      { status: 404 },
    );
  return Response.json({ article });
}

export async function adminCreateKnowledge(
  adminId: string | null,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await readJson(request);
  if (!payload.ok)
    return Response.json({ error: payload.error }, { status: 400 });
  const parsed = parseKnowledgeArticle(payload.value);
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const created = await getBeyondMasterKnowledgeRepository().create(
    parsed.value,
    new Date(),
  );
  if (!created.ok)
    return Response.json({ error: created.error }, { status: created.status });
  invalidateBeyondMasterKnowledgeCache();
  return Response.json({ article: created.article }, { status: 201 });
}

export async function adminUpdateKnowledge(
  adminId: string | null,
  id: string,
  request: Request,
) {
  if (!adminId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!/^[-a-zA-Z0-9_]{6,40}$/.test(id)) {
    return Response.json(
      { error: "That article was not found." },
      { status: 404 },
    );
  }
  const payload = await readJson(request);
  if (!payload.ok)
    return Response.json({ error: payload.error }, { status: 400 });
  const parsed = parseKnowledgeArticle(payload.value);
  if (!parsed.ok)
    return Response.json({ error: parsed.error }, { status: 400 });
  const updated = await getBeyondMasterKnowledgeRepository().update(
    id,
    parsed.value,
    new Date(),
  );
  if (!updated.ok)
    return Response.json({ error: updated.error }, { status: updated.status });
  invalidateBeyondMasterKnowledgeCache();
  return Response.json({ article: updated.article });
}

const prismaKnowledgeRepository: KnowledgeRepository = {
  async list(input) {
    try {
      const where = whereOf(input);
      const [totalAll, published, grouped, total, rows] = await Promise.all([
        prisma.beyondMasterKnowledgeArticle.count(),
        prisma.beyondMasterKnowledgeArticle.count({
          where: { published: true },
        }),
        prisma.beyondMasterKnowledgeArticle.groupBy({
          by: ["category"],
          _count: { _all: true },
        }),
        prisma.beyondMasterKnowledgeArticle.count({ where }),
        prisma.beyondMasterKnowledgeArticle.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
      ]);
      return {
        ok: true as const,
        counts: {
          total: totalAll,
          published,
          unpublished: totalAll - published,
          categories: grouped.length,
        },
        articles: rows.map(fromRow),
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    } catch (error) {
      return asFailure(error);
    }
  },
  async get(id) {
    try {
      const row = await prisma.beyondMasterKnowledgeArticle.findUnique({
        where: { id },
      });
      return row ? fromRow(row) : null;
    } catch (error) {
      return asFailure(error);
    }
  },
  async create(input, now) {
    try {
      const row = await prisma.beyondMasterKnowledgeArticle.create({
        data: {
          ...input,
          keywords: input.keywords,
          createdAt: now,
          updatedAt: now,
        },
      });
      return { ok: true, article: fromRow(row) };
    } catch (error) {
      return asFailure(error);
    }
  },
  async update(id, input, now) {
    try {
      const row = await prisma.beyondMasterKnowledgeArticle.update({
        where: { id },
        data: { ...input, keywords: input.keywords, updatedAt: now },
      });
      return { ok: true, article: fromRow(row) };
    } catch (error) {
      return asFailure(error);
    }
  },
};

function fromRow(row: {
  id: string;
  slug: string;
  category: string;
  title: string;
  body: string;
  keywords: unknown;
  published: boolean;
  sourceNote: string;
  createdAt: Date;
  updatedAt: Date;
}): KnowledgeAdminArticle {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as BeyondMasterKnowledgeCategory,
    title: row.title,
    body: row.body,
    keywords: Array.isArray(row.keywords)
      ? row.keywords.filter((item): item is string => typeof item === "string")
      : [],
    published: row.published,
    sourceNote: row.sourceNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function whereOf(
  input: KnowledgeListQuery,
): Prisma.BeyondMasterKnowledgeArticleWhereInput {
  const query = input.query.trim();
  return {
    ...(input.category ? { category: input.category } : {}),
    ...(input.published === null ? {} : { published: input.published }),
    ...(query
      ? {
          OR: [
            { slug: { contains: query, mode: "insensitive" } },
            { title: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

function asFailure(error: unknown): KnowledgeFailure {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      ok: false,
      status: 409,
      code: "duplicate_slug",
      error: "That slug is already used.",
    };
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return {
      ok: false,
      status: 404,
      code: "not_found",
      error: "That article was not found.",
    };
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return {
      ok: false,
      status: 503,
      code: "migration_pending",
      error: KNOWLEDGE_MIGRATION_MESSAGE,
    };
  }
  return {
    ok: false,
    status: 503,
    code: "database",
    error: "Knowledge articles could not be loaded.",
  };
}

function countsOf(articles: KnowledgeAdminArticle[]): KnowledgeCounts {
  const published = articles.filter((article) => article.published).length;
  return {
    total: articles.length,
    published,
    unpublished: articles.length - published,
    categories: new Set(articles.map((article) => article.category)).size,
  };
}

function filterArticles(
  articles: KnowledgeAdminArticle[],
  input: KnowledgeListQuery,
) {
  const query = input.query.trim().toLowerCase();
  return articles
    .filter((article) =>
      input.category ? article.category === input.category : true,
    )
    .filter((article) =>
      input.published === null ? true : article.published === input.published,
    )
    .filter((article) =>
      query
        ? article.slug.includes(query) ||
          article.title.toLowerCase().includes(query)
        : true,
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function filterBuiltins(input: KnowledgeListQuery): KnowledgeBuiltinArticle[] {
  const query = input.query.trim().toLowerCase();
  return builtinKnowledgeArticles().filter((article) => {
    if (input.category && article.category !== input.category) return false;
    if (input.published !== null && article.published !== input.published)
      return false;
    if (!query) return true;
    return (
      article.slug.includes(query) ||
      article.title.toLowerCase().includes(query)
    );
  });
}

function keywordsOf(value: unknown, title: string) {
  const provided = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
  const source =
    provided.length > 0 ? provided : title.split(/[^\p{L}\p{N}]+/u);
  return source
    .map((item) => sanitizeKnowledgeText(item).toLowerCase())
    .filter((item) => item.length >= 3)
    .slice(0, 40);
}

async function readJson(
  request: Request,
): Promise<{ ok: true; value: unknown } | { ok: false; error: string }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return { ok: false, error: "Send valid JSON." };
  }
}
