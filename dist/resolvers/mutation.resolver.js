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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutation = void 0;
const server_1 = require("../server");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const aws_1 = __importDefault(require("../helperMethods/aws"));
exports.Mutation = {
    uploadFile(parent, { file }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { createReadStream, filename, mimetype, encoding } = yield file;
            return { filename, mimetype, encoding };
        });
    },
    createVendor(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            let password = "";
            args.data.password = yield bcrypt_1.default.hash(args.data.password, 10);
            const emailExist = yield server_1.prisma.vendor.findUnique({ where: { email: args.data.email } });
            if (emailExist)
                throw new Error("Email Already Exist");
            const vendor = yield server_1.prisma.vendor.create({
                data: Object.assign({}, args.data)
            });
            return vendor;
        });
    },
    login(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorDetails = yield server_1.prisma.vendor.findUnique({
                where: {
                    email: args.data.email
                }
            });
            if (!vendorDetails)
                return "Please Check Your Password or Email";
            const isUser = yield bcrypt_1.default.compare(args.data.password, vendorDetails ? vendorDetails.password : "");
            if (!isUser)
                throw new Error("Login Details not correct");
            const token = jsonwebtoken_1.default.sign({
                userId: vendorDetails === null || vendorDetails === void 0 ? void 0 : vendorDetails.id
            }, 'secret', { expiresIn: 60 * 60 });
            return { vendorDetails, token, message: "You have successfully Logged in" };
        });
    },
    createProduct(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield server_1.prisma.product.create({
                data: {
                    vendor_id: args === null || args === void 0 ? void 0 : args.vendor_id,
                    name: args.data.name,
                    description: args.data.description,
                    price: args.data.price,
                }
            });
            console.log("image", args.data.imageFile);
            (0, aws_1.default)(args.data.imageFile);
            for (let i = 0; i < args.data.categories.length; i++) {
                yield server_1.prisma.categoryProduct.create({
                    data: {
                        product_id: product === null || product === void 0 ? void 0 : product.id,
                        category_id: args.data.categories[i]
                    }
                });
            }
            return product;
        });
    },
    createCategory(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield server_1.prisma.category.create({
                data: {
                    name: args.data.name
                }
            });
            return { category, message: "Successful" };
        });
    },
    deleteProduct(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const productExist = yield server_1.prisma.product.findUnique({ where: { id: args.id } });
            if (!productExist)
                throw new Error("Product does not exist");
            const product = yield server_1.prisma.product.delete({
                where: {
                    id: args.id
                }
            });
            return product;
        });
    },
    updateVendor(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const VendorExist = yield server_1.prisma.vendor.findUnique({ where: { id: args.id } });
            if (args.data.password) {
                args.data.password = yield bcrypt_1.default.hash(args.data.password, 10);
            }
            if (!VendorExist)
                throw new Error("Vendor does not exist");
            const vendor = yield server_1.prisma.vendor.update({
                where: {
                    id: args.id
                }, data: Object.assign({}, args.data)
            });
            return vendor;
        });
    },
};
