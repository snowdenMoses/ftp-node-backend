"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const server_1 = require("../server");
function createRandomVendors() {
    return {
        first_name: faker_1.faker.person.firstName(),
        last_name: faker_1.faker.person.lastName(),
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password(),
    };
}
function createRandomProducts(vendor_id) {
    return {
        name: faker_1.faker.commerce.productName(),
        description: faker_1.faker.commerce.productDescription(),
        price: Number(faker_1.faker.commerce.price()),
        vendor_id: vendor_id,
    };
}
function createVendors(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const vendors = faker_1.faker.helpers.multiple(createRandomVendors, {
            count: 20,
        });
        yield server_1.prisma.vendor.createMany({ data: vendors });
        callback();
    });
}
function createProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting.......");
        const allVendors = yield server_1.prisma.vendor.findMany();
        const arrayOfVendorsId = allVendors.map(vendor => vendor.id);
        for (let i = 0; i < arrayOfVendorsId.length; i++) {
            yield server_1.prisma.product.create({
                data: createRandomProducts(arrayOfVendorsId[i])
            });
        }
        console.log("Completed!!!!");
    });
}
createVendors(createProducts);
