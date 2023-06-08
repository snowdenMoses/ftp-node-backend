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
exports.Query = void 0;
const server_1 = require("../server");
exports.Query = {
    vendor(parent, { id }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield server_1.prisma.vendor.findUnique({ where: { id } });
        });
    },
    currentVendor(_, __, { currenUserId }, info) {
        return __awaiter(this, void 0, void 0, function* () {
            if (currenUserId) {
                try {
                    return yield server_1.prisma.vendor.findUnique({ where: { id: currenUserId } });
                }
                catch (err) {
                }
            }
        });
    },
    vendors() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield server_1.prisma.vendor.findMany();
        });
    },
    products() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield server_1.prisma.product.findMany({
                orderBy: {
                    created_at: "desc"
                }
            });
        });
    },
    categories() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield server_1.prisma.category.findMany();
        });
    }
};
