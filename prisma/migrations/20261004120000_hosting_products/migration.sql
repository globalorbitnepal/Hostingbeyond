-- CreateEnum
CREATE TYPE "HostingProductCategory" AS ENUM ('WEBSITE', 'DEVELOPER', 'VPS', 'BUSINESS');

-- CreateEnum
CREATE TYPE "HostingProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "HostingProduct" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "HostingProductCategory" NOT NULL,
    "status" "HostingProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "canonicalPath" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "heroTitle" TEXT NOT NULL DEFAULT '',
    "heroDescription" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT,
    "heroVideo" TEXT,
    "heroCtaLabel" TEXT,
    "heroCtaHref" TEXT,
    "secondaryCtaLabel" TEXT,
    "secondaryCtaHref" TEXT,
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "features" JSONB NOT NULL DEFAULT '[]',
    "includedFeatures" JSONB NOT NULL DEFAULT '[]',
    "specifications" JSONB NOT NULL DEFAULT '{}',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "sectionFlags" JSONB NOT NULL DEFAULT '{}',
    "seo" JSONB,
    "billingMonthlyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "billingYearlyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "legacyCmsSlug" TEXT,
    "pageTemplate" TEXT NOT NULL DEFAULT 'standard',
    "seoRegistrySlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostingProductPlan" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "yearlyPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "setupFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tagline" TEXT,
    "storage" TEXT,
    "bandwidth" TEXT,
    "websites" TEXT,
    "domains" TEXT,
    "emailAccounts" TEXT,
    "databases" TEXT,
    "ssl" TEXT,
    "backup" TEXT,
    "support" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingProductPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostingProduct_slug_key" ON "HostingProduct"("slug");

-- CreateIndex
CREATE INDEX "HostingProduct_category_idx" ON "HostingProduct"("category");

-- CreateIndex
CREATE INDEX "HostingProduct_status_idx" ON "HostingProduct"("status");

-- CreateIndex
CREATE INDEX "HostingProduct_displayOrder_idx" ON "HostingProduct"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "HostingProductPlan_productId_planKey_key" ON "HostingProductPlan"("productId", "planKey");

-- CreateIndex
CREATE INDEX "HostingProductPlan_productId_idx" ON "HostingProductPlan"("productId");

-- CreateIndex
CREATE INDEX "HostingProductPlan_active_idx" ON "HostingProductPlan"("active");

-- AddForeignKey
ALTER TABLE "HostingProductPlan" ADD CONSTRAINT "HostingProductPlan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "HostingProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
