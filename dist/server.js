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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const vendorsLoader_1 = require("./vendorsLoader");
const vendorIdFromToken_1 = __importDefault(require("./vendor/vendorIdFromToken"));
const aws_1 = __importDefault(require("./aws"));
const port = process.env.PORT || 4000;
exports.prisma = new client_1.PrismaClient();
const typeDefs = (0, apollo_server_1.gql) `
type Query{
    vendor(id: String): Vendor
    vendors: [Vendor]
    products: [Product]
    currentVendor: Vendor
    categories: [Category]
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
    categories: [Category]
}
type Image{
    id: String
    url: String
    product: Product
    created_at: String
    updated_at: String
}
type Category{
    id: String
    name: String
    products: [Product]
    created_at: String
    updated_at: String
}
type CategoryProduct{
    id: String
    category: [Category]
    product: [Product]
    created_at: String
    updated_at: String
}

type Mutation{
    createVendor(data: createVendorInput): Vendor
    createProduct(vendor_id: String , data: createProductInput): Product
    deleteProduct(id: String): Product
    updateVendor(id: String, data: updateVendorInput): Vendor
    login(data: vendorLoginInput): Token
    createCategory(data: CreateCategoryInput): CategoryPayload
}
type Token{
    vendorDetails: Vendor
    token: String
    message: String
}
type CategoryPayload{
    category: Category
    message: String
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
    imageFile: String
    categories: [String]!
}
input CreateCategoryInput{
    name: String
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
        currentVendor(_, __, { currenUserId }, info) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(currenUserId);
                if (currenUserId) {
                    try {
                        return yield exports.prisma.vendor.findUnique({ where: { id: currenUserId } });
                    }
                    catch (err) {
                        console.log("User not Found");
                    }
                }
            });
        },
        vendors() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.prisma.vendor.findMany();
            });
        },
        products() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.prisma.product.findMany({ orderBy: {
                        created_at: "desc"
                    } });
            });
        },
        categories() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.prisma.category.findMany();
            });
        }
    },
    Product: {
        vendor(parent, args, ctx, info) {
            // return prisma.vendor.findUnique({where:{id: parent.vendor_id}})
            return vendorsLoader_1.cacheUser.load(parent.vendor_id);
        },
        categories(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const parent_id = parent.id;
                const category_product = yield exports.prisma.$queryRaw `
            SELECT categories.name, categories.id
            FROM categories_products
            JOIN categories ON  categories.id  = categories_products.category_id
            JOIN products ON  products.id = categories_products.product_id
            WHERE products.id = ${parent_id}
            ;
             `;
                return category_product;
            });
        }
    },
    Vendor: {
        products(parent, args, ctx, info) {
            return exports.prisma.product.findMany({ where: { vendor_id: parent.id } });
        }
    },
    Category: {
        products(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                const parent_id = parent.id;
                const category_product = yield exports.prisma.$queryRaw `
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
                    userId: vendorDetails === null || vendorDetails === void 0 ? void 0 : vendorDetails.id
                }, 'secret', { expiresIn: 60 * 60 });
                return { vendorDetails, token, message: "You have successfully Logged in" };
            });
        },
        createProduct(parent, args, ctx, info) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Products Args", args);
                const product = yield exports.prisma.product.create({
                    data: {
                        vendor_id: args === null || args === void 0 ? void 0 : args.vendor_id,
                        name: args.data.name,
                        description: args.data.description,
                        price: args.data.price,
                    }
                });
                (0, aws_1.default)(args.data.imageFile);
                for (let i = 0; i < args.data.categories.length; i++) {
                    yield exports.prisma.categoryProduct.create({
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
                const category = yield exports.prisma.category.create({
                    data: {
                        name: args.data.name
                    }
                });
                console.log(category);
                return { category, message: "Successful" };
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
};
const server = new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => __awaiter(void 0, void 0, void 0, function* () {
        const bearerToken = String(req.headers.authorization);
        const token = bearerToken.split("Bearer ")[1];
        const currenUserId = yield (0, vendorIdFromToken_1.default)(token);
        return {
            currenUserId: currenUserId === null || currenUserId === void 0 ? void 0 : currenUserId.userId
        };
    })
});
server.listen(`${port}`).then(({ url }) => console.log(`Server is running at ${url}`));
