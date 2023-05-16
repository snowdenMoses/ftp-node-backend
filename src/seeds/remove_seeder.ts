import { prisma } from '../server';

async function dropVendors(){
    await prisma.vendor.deleteMany()
}
async function dropProducts(){
    await prisma.product.deleteMany()
}

dropProducts()
dropVendors()


console.log("Dropped")