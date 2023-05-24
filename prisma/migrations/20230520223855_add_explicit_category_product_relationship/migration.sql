/*
  Warnings:

  - You are about to drop the `_CategoryToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToProduct" DROP CONSTRAINT "_CategoryToProduct_B_fkey";

-- DropTable
DROP TABLE "_CategoryToProduct";

-- CreateTable
CREATE TABLE "categories_products" (
    "category_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "categories_products_pkey" PRIMARY KEY ("category_id","product_id")
);

-- AddForeignKey
ALTER TABLE "categories_products" ADD CONSTRAINT "categories_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_products" ADD CONSTRAINT "categories_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
