import { prisma } from "../server"

export const Category = {
        async products(parent, args, ctx, info){
        const parent_id = parent.id
        const category_product = await prisma.$queryRaw`
            SELECT products.name, products.id, products.description, products.price
            FROM categories_products
            JOIN categories ON  categories.id  = categories_products.category_id
            JOIN products ON  products.id = categories_products.product_id
            WHERE categories.id = ${parent_id}
            ;
             `
        return category_product
    }
}