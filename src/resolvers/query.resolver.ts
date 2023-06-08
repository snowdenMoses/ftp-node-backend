import { prisma } from "../server"

export const Query = {
        async vendor(parent: any, { id }: any, ctx: any, info: any){
            return await prisma.vendor.findUnique({ where: { id } })
        },
        async currentVendor(_: any, __: any, { currenUserId }: any, info: any){
            if (currenUserId) {
                try {
                    return await prisma.vendor.findUnique({ where: { id: currenUserId } })
                }
                catch (err) {
                }
            }
        },
        async vendors(){
            return await prisma.vendor.findMany()
        },
        async products(){
            return await prisma.product.findMany({
                orderBy: {
                    created_at: "desc"
                }
            })
        },
        async categories(){
            return await prisma.category.findMany()
        }
}