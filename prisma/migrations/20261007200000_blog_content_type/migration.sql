-- CreateEnum
CREATE TYPE "BlogContentType" AS ENUM ('BLOG', 'TIP');

-- CreateEnum
CREATE TYPE "BlogGuideType" AS ENUM ('HOW_TO', 'STEP_BY_STEP', 'BEGINNER_GUIDE', 'TROUBLESHOOTING', 'BEST_PRACTICES', 'EXPLAINER', 'CHECKLIST');

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "contentType" "BlogContentType" NOT NULL DEFAULT 'BLOG',
ADD COLUMN     "guideType" "BlogGuideType";

-- CreateIndex
CREATE INDEX "BlogPost_contentType_status_publishedAt_idx" ON "BlogPost"("contentType", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "BlogPost_contentType_viewCount_idx" ON "BlogPost"("contentType", "viewCount");
