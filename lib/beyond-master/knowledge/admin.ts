import { BEYOND_MASTER_BUILTIN_ARTICLES } from "@/lib/beyond-master/knowledge/articles";
import { BEYOND_MASTER_KNOWLEDGE_CATEGORIES } from "@/lib/beyond-master/knowledge/categories";

export function beyondMasterKnowledgeAdminStatus(
  articles = BEYOND_MASTER_BUILTIN_ARTICLES,
) {
  const published = articles.filter((article) => article.published);
  return {
    product: "AI Agent",
    management: "read-only metadata for a future Orbit screen",
    categories: BEYOND_MASTER_KNOWLEDGE_CATEGORIES,
    counts: {
      total: articles.length,
      published: published.length,
      unpublished: articles.length - published.length,
    },
    articles: articles.map((article) => ({
      slug: article.slug,
      category: article.category,
      title: article.title,
      published: article.published,
      source: article.source,
    })),
  };
}
