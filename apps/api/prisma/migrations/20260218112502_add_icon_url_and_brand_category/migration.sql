-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "category_id" TEXT;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "icon_url" TEXT;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
