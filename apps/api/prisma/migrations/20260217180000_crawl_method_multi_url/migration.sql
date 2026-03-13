-- CreateEnum
CREATE TYPE "CrawlMethod" AS ENUM ('CAMPAIGN', 'PRODUCT', 'RSS', 'FEED');

-- Add new columns with defaults first
ALTER TABLE "crawl_sources" ADD COLUMN "crawl_method" "CrawlMethod" NOT NULL DEFAULT 'CAMPAIGN';
ALTER TABLE "crawl_sources" ADD COLUMN "seed_urls" TEXT[] NOT NULL DEFAULT '{}';

-- Migrate existing data: map old type to new crawlMethod, copy seedUrl to seedUrls
UPDATE "crawl_sources" SET "crawl_method" = CASE
  WHEN "type" = 'SCRAPE' THEN 'CAMPAIGN'::"CrawlMethod"
  WHEN "type" = 'RSS' THEN 'RSS'::"CrawlMethod"
  WHEN "type" = 'API' THEN 'FEED'::"CrawlMethod"
  WHEN "type" = 'FEED' THEN 'FEED'::"CrawlMethod"
  ELSE 'CAMPAIGN'::"CrawlMethod"
END;

UPDATE "crawl_sources" SET "seed_urls" = ARRAY["seed_url"];

-- Remove defaults (now that data is populated)
ALTER TABLE "crawl_sources" ALTER COLUMN "crawl_method" DROP DEFAULT;
ALTER TABLE "crawl_sources" ALTER COLUMN "seed_urls" DROP DEFAULT;

-- Drop old columns
ALTER TABLE "crawl_sources" DROP COLUMN "type";
ALTER TABLE "crawl_sources" DROP COLUMN "seed_url";

-- Drop old enum
DROP TYPE "SourceType";
