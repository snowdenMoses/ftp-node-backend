import { prisma } from "../server"

export const Vendor = {
    products(parent, args, ctx, info){
        return prisma.product.findMany({ where: { vendor_id: parent.id } })
    }
}