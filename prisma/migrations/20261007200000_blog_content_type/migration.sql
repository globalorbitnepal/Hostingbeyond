-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BlogContentType" AS ENUM ('BLOG', 'TIP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BlogGuideType" AS ENUM ('HOW_TO', 'STEP_BY_STEP', 'BEGINNER_GUIDE', 'TROUBLESHOOTING', 'BEST_PRACTICES', 'EXPLAINER', 'CHECKLIST');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "contentType" "BlogContentType" NOT NULL DEFAULT 'BLOG',
ADD COLUMN IF NOT EXISTS "guideType" "BlogGuideType";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlogPost_contentType_status_publishedAt_idx" ON "BlogPost"("contentType", "status", "publishedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlogPost_contentType_viewCount_idx" ON "BlogPost"("contentType", "viewCount");
