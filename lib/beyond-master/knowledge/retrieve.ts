import {
  BEYOND_MASTER_BUILTIN_ARTICLES,
  type BeyondMasterKnowledgeArticle,
} from "@/lib/beyond-master/knowledge/articles";
import { isBeyondMasterKnowledgeCategory } from "@/lib/beyond-master/knowledge/categories";
import { sanitizeKnowledgeText } from "@/lib/beyond-master/knowledge/sanitize";

const MAX_ARTICLES = 3;
const MIN_SCORE = 3;

export type KnowledgeRetrieval = {
  articles: BeyondMasterKnowledgeArticle[];
  insufficient: boolean;
};

export function retrieveBeyondMasterKnowledge(
  question: string,
  articles: readonly BeyondMasterKnowledgeArticle[] = BEYOND_MASTER_BUILTIN_ARTICLES,
): KnowledgeRetrieval {
  const haystack = normalize(question);
  if (!haystack) return { articles: [], insufficient: true };
  const ranked = articles
    .filter((article) => article.published)
    .map((article) => ({
      article: present(article),
      score: score(haystack, article),
    }))
    .filter((row) => row.score >= MIN_SCORE)
    .sort(
      (a, b) =>
        b.score - a.score || a.article.slug.localeCompare(b.article.slug),
    )
    .slice(0, MAX_ARTICLES);
  if (ranked.length === 0) return { articles: [], insufficient: true };
  return {
    articles: ranked.map((row) => row.article),
    insufficient: false,
  };
}

export function mergeKnowledgeArticles(
  database: readonly BeyondMasterKnowledgeArticle[] | null,
): BeyondMasterKnowledgeArticle[] {
  if (!database)
    return BEYOND_MASTER_BUILTIN_ARTICLES.filter(
      (article) => article.published,
    );
  const bySlug = new Map(database.map((article) => [article.slug, article]));
  const merged: BeyondMasterKnowledgeArticle[] = [];
  for (const builtin of BEYOND_MASTER_BUILTIN_ARTICLES) {
    const override = bySlug.get(builtin.slug);
    if (!override) {
      if (builtin.published) merged.push(builtin);
      continue;
    }
    bySlug.delete(builtin.slug);
    if (!override.published) {
      if (builtin.published) merged.push(builtin);
      continue;
    }
    if (!isBeyondMasterKnowledgeCategory(override.category)) {
      if (builtin.published) merged.push(builtin);
      continue;
    }
    merged.push(present(override));
  }
  for (const extra of bySlug.values()) {
    if (extra.published && isBeyondMasterKnowledgeCategory(extra.category)) {
      merged.push(present(extra));
    }
  }
  return merged;
}

function present(
  article: BeyondMasterKnowledgeArticle,
): BeyondMasterKnowledgeArticle {
  return {
    slug: article.slug,
    category: article.category,
    title: sanitizeKnowledgeText(article.title).slice(0, 160),
    body: sanitizeKnowledgeText(article.body),
    keywords: article.keywords
      .map((keyword) => sanitizeKnowledgeText(keyword).slice(0, 80))
      .filter(Boolean)
      .slice(0, 40),
    published: article.published,
    source: article.source,
  };
}

function score(
  haystack: string,
  article: BeyondMasterKnowledgeArticle,
): number {
  let total = 0;
  for (const keyword of article.keywords) {
    const needle = normalize(keyword);
    if (needle.length < 2 || !haystack.includes(needle)) continue;
    total += needle.length >= 3 ? 3 : 2;
  }
  return total;
}

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}.+\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
