"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const query_resolver_1 = require("./query.resolver");
const mutation_resolver_1 = require("./mutation.resolver");
const product_resolver_1 = require("./product.resolver");
const vendor_resolver_1 = require("./vendor.resolver");
const category_resolver_1 = require("./category.resolver");
exports.resolvers = {
    Query: query_resolver_1.Query,
    Mutation: mutation_resolver_1.Mutation,
    Product: product_resolver_1.Product,
    Vendor: vendor_resolver_1.Vendor,
    Category: category_resolver_1.Category
};
