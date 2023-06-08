"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const product = `#graphql 
const Product = {
    id: String,
    name: String,
    description: String,
    price: Int,
    created_at: String,
    updated_at: String,
    vendor: Vendor,
    categories: [Category]
};
exports.default = product;
