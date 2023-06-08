import { prisma } from "../server"
import { cacheUser } from "../helperMethods/vendorsLoader";

export const Product = {
    vendor(parent, args, ctx, info) {
        // return prisma.vendor.findUnique({where:{id: parent.vendor_id}})
        return cacheUser.load(parent.vendor_id)

    },
    async categories(parent, args, ctx, info) {
        const parent_id = parent.id
        const category_product = await prisma.$queryRaw`
            SELECT categories.name, categories.id
            FROM categories_products
            JOIN categories ON  categories.id  = categories_products.category_id
            JOIN products ON  products.id = categories_products.product_id
            WHERE products.id = ${parent_id}
            ;
             `
        return category_product


    }
}