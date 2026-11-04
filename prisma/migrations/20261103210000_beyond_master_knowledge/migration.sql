-- Beyond Master AI knowledge articles. Does not alter customer, billing, or Beyond AI tables.
CREATE TABLE "BeyondMasterKnowledgeArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sourceNote" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeyondMasterKnowledgeArticle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BeyondMasterKnowledgeArticle_slug_key" ON "BeyondMasterKnowledgeArticle"("slug");
CREATE INDEX "BeyondMasterKnowledgeArticle_category_idx" ON "BeyondMasterKnowledgeArticle"("category");
CREATE INDEX "BeyondMasterKnowledgeArticle_published_idx" ON "BeyondMasterKnowledgeArticle"("published");
