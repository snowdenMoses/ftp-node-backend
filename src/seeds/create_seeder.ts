import { faker } from '@faker-js/faker';
import { IProduct } from '../interface/product.interface';
import { prisma } from '../server';
import { IVendor } from '../interface/vendor.interface';

function createRandomVendors(): IVendor {
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    };
}

function createRandomProducts(vendor_id): IProduct {
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        vendor_id: vendor_id,
    };
}

async function createVendors(callback) {
    const vendors: IVendor[] = faker.helpers.multiple(createRandomVendors, {
        count: 20,
    });
    await prisma.vendor.createMany({ data: vendors })
    callback()
}
async function createProducts() {
    console.log("Starting.......")
    const allVendors = await prisma.vendor.findMany()
    const arrayOfVendorsId = allVendors.map(vendor => vendor.id)
    for (let i = 0; i < arrayOfVendorsId.length; i++) {
        await prisma.product.create({
            data: createRandomProducts(arrayOfVendorsId[i])
        })
    }
    console.log("Completed!!!!")
}
createVendors(createProducts)