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
exports.Category = void 0;
const server_1 = require("../server");
exports.Category = {
    products(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent_id = parent.id;
            const category_product = yield server_1.prisma.$queryRaw `
            SELECT products.name, products.id, products.description, products.price
            FROM categories_products
            JOIN categories ON  categories.id  = categories_products.category_id
            JOIN products ON  products.id = categories_products.product_id
            WHERE categories.id = ${parent_id}
            ;
             `;
            return category_product;
        });
    }
};
