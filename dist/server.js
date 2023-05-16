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
exports.prisma = void 0;
const apollo_server_1 = require("apollo-server");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const vendorsLoader_1 = require("./vendorsLoader");
const port = process.env.PORT || 4000;
const pubSub = new graphql_subscriptions_1.PubSub();
exports.prisma = new client_1.PrismaClient();
const typeDefs = (0, apollo_server_1.gql) `
type Query{
    vendor(id: ID): Vendor
    vendors: [Vendor]
    products: [Product]
    currentVendor: Vendor
}
type Vendor{
    id: String
    first_name: String
    last_name: String
    email: String
    created_at: String
    updated_at: String
    password: String
    products: [Product]
}

type Product{
    id: String
    name: String
    description: String
    price: Int
    created_at: String
    updated_at: String
    vendor: Vendor
}

type Mutation{
    createVendor(data: createVendorInput): Vendor
    createProduct(vendor_id: String , data: createProductInput): Product
    deleteProduct(id: String): Product
    updateVendor(id: String, data: updateVendorInput): Vendor
    login(data: vendorLoginInput): Token
}
type Token{
    vendorDetails: Vendor
    token: String
}

# type Subscription{
#     count: Int
# }

input createVendorInput{
    first_name: String
    last_name: String
    email: String
    password: String
}

input createProductInput{
    name: String
    description: String
    price: Int
    vendor_id: String
}

input vendorLoginInput{
    password: String
    email: String
}

input updateVendorInput{
    first_name: String
    last_name: String
    email: String
    password: String
}
`;
const resolvers = {
    Query: {
        vendor(parent, { id }, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.prisma.vendor.findUnique({ where: { id } });
            });
        },
        currentVendor(_, __, { token }, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const userId = yield jsonwebtoken_1.default.verify(token, 'secret');
                console.log(userId);
                return yield exports.prisma.vendor.findUnique({ where: { id: userId } });
            });
        },
        vendors() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.prisma.vendor.findMany();
            });
        },
        products() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.prisma.product.findMany();
            });
        }
    },
    Product: {
        vendor(parent, args, { userToken }, info) {
            // return prisma.vendor.findUnique({where:{id: parent.vendor_id}})
            return vendorsLoader_1.cacheUser.load(parent.vendor_id);
        }
    },
    Vendor: {
        products(parent, args, ctx, info) {
            return exports.prisma.product.findMany({ where: { vendor_id: parent.id } });
        }
    },
    Mutation: {
        createVendor(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                let password = "";
                args.data.password = yield bcrypt_1.default.hash(args.data.password, 10);
                const emailExist = yield exports.prisma.vendor.findUnique({ where: { email: args.data.email } });
                if (emailExist)
                    throw new Error("Email Already Exist");
                const vendor = yield exports.prisma.vendor.create({
                    data: Object.assign({}, args.data)
                });
                return vendor;
            });
        },
        login(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const vendorDetails = yield exports.prisma.vendor.findUnique({
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
                    data: vendorDetails === null || vendorDetails === void 0 ? void 0 : vendorDetails.id
                }, 'secret', { expiresIn: 60 * 60 });
                return { vendorDetails, token };
            });
        },
        createProduct(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const product = yield exports.prisma.product.create({
                    data: Object.assign(Object.assign({}, args.data), { vendor_id: args.vendor_id })
                });
                return product;
            });
        },
        deleteProduct(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const productExist = yield exports.prisma.product.findUnique({ where: { id: args.id } });
                if (!productExist)
                    throw new Error("Product does not exist");
                const product = yield exports.prisma.product.delete({
                    where: {
                        id: args.id
                    }
                });
                return product;
            });
        },
        updateVendor(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const VendorExist = yield exports.prisma.vendor.findUnique({ where: { id: args.id } });
                if (args.data.password) {
                    args.data.password = yield bcrypt_1.default.hash(args.data.password, 10);
                }
                if (!VendorExist)
                    throw new Error("Vendor does not exist");
                const vendor = yield exports.prisma.vendor.update({
                    where: {
                        id: args.id
                    }, data: Object.assign({}, args.data)
                });
                return vendor;
            });
        },
    },
    // Subscription:{
    //     count:{
    //         subscribe(){
    //             let count = 0
    //             setInterval(()=>{
    //                 pubSub.publish("count", {
    //                     count: count
    //                 })
    //                 count++
    //             },1000)
    //             return pubSub.asyncIterator("count")
    //         }
    //     }
    // }
};
const server = new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        console.log(req.headers.authorization);
        return {
            token: req.headers.authorization,
            pubSub
        };
    }
});
server.listen(`${port}`).then(({ url }) => console.log(`Server is running at ${url}`));
