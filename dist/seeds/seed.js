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
function createRandomProducts() {
    return {
        name: faker_1.faker.vehicle.type(),
        description: faker_1.faker.vehicle.model(),
        price: Number(faker_1.faker.commerce.price()),
        vendor_id: "1d09a6a0-2fcd-4c52-83e7-ccac0f63cf67",
    };
}
function createVendors() {
    return __awaiter(this, void 0, void 0, function* () {
        const vendors = faker_1.faker.helpers.multiple(createRandomVendors, {
            count: 5,
        });
        yield server_1.prisma.vendor.createMany({ data: vendors });
    });
}
function createProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        const Products = faker_1.faker.helpers.multiple(createRandomProducts, {
            count: 6,
        });
        yield server_1.prisma.product.createMany({ data: Products });
    });
}
createVendors();
createProducts();
console.log("Completed");
