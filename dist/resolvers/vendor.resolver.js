"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vendor = void 0;
const server_1 = require("../server");
exports.Vendor = {
    products(parent, args, ctx, info) {
        return server_1.prisma.product.findMany({ where: { vendor_id: parent.id } });
    }
};
