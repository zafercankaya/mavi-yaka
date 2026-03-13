-- AlterEnum
ALTER TYPE "CrawlMethod" ADD VALUE 'API';

-- AlterTable
ALTER TABLE "crawl_sources" ADD COLUMN     "discovered_api_url" TEXT,
ADD COLUMN     "discovered_feed_url" TEXT;
