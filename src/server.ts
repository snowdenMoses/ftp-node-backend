import { gql, ApolloServer } from "apollo-server";
import { PubSub } from "graphql-subscriptions";
import { PrismaClient, Vendor } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import { cacheUser } from "./vendorsLoader";
import vendorIdFromToken from "./vendor/vendorIdFromToken";
import s3ImageUpload from "./aws"


const port = process.env.PORT || 4000
export const prisma = new PrismaClient()

const typeDefs = gql`
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
`
const resolvers = {
    Query: {
        async vendor(parent:any, {id}:any, ctx:any, info:any){
            return await prisma.vendor.findUnique({where:{id}})
        },
        async currentVendor(_: any, __: any, { currenUserId }:any, info:any){
            console.log(currenUserId);
            
            if (currenUserId){
                try {
                    return await prisma.vendor.findUnique({ where: { id: currenUserId } })
                }
                catch (err) {
                    console.log("User not Found")
                }
            }
           
        },
        async vendors(){
            return await prisma.vendor.findMany()
        },
        async products(){
            return await prisma.product.findMany({orderBy: {
                created_at: "desc"
            }})
        },
        async categories(){
            return  await prisma.category.findMany()
        }
    },
    Product:{
        vendor(parent, args, ctx, info){
            // return prisma.vendor.findUnique({where:{id: parent.vendor_id}})
            return cacheUser.load(parent.vendor_id)
          
        },
        async categories(parent, args, ctx, info){
            const parent_id = parent.id
            const category_product = await prisma.$queryRaw `
            SELECT categories.name, categories.id
            FROM categories_products
            JOIN categories ON  categories.id  = categories_products.category_id
            JOIN products ON  products.id = categories_products.product_id
            WHERE products.id = ${parent_id}
            ;
             `
            return category_product
            
          
        }
    },
    Vendor:{
        products(parent, args, ctx, info){
            return prisma.product.findMany({where: {vendor_id: parent.id}})
        }
    },
    Category:{
        async products(parent, args, ctx, info){
            const parent_id = parent.id
            const category_product = await prisma.$queryRaw `
            SELECT products.name, products.id, products.description, products.price
            FROM categories_products
            JOIN categories ON  categories.id  = categories_products.category_id
            JOIN products ON  products.id = categories_products.product_id
            WHERE categories.id = ${parent_id}
            ;
             `
            return category_product
        }
    },

    Mutation:{
        async createVendor(parent, args, ctx, info){
            let password = ""
            args.data.password = await bcrypt.hash(args.data.password, 10);
            const emailExist = await prisma.vendor.findUnique({where: {email: args.data.email}})
            if(emailExist) throw new Error("Email Already Exist")
            const vendor = await prisma.vendor.create({
                data:{
                ...args.data,
            }
            })
            return vendor
        },

        async login(parent, args, ctx, info) {
            const vendorDetails: Vendor | null = await prisma.vendor.findUnique({
                where: {
                    email: args.data.email
                }
            })
            if (!vendorDetails) return "Please Check Your Password or Email"
            const isUser = await bcrypt.compare(args.data.password, vendorDetails ? vendorDetails.password : "");
            if (!isUser) throw new Error("Login Details not correct")
            const token = jwt.sign({
                userId: vendorDetails?.id
            }, 'secret', { expiresIn: 60 * 60 });

            return { vendorDetails, token, message:"You have successfully Logged in" }
        }, 
        async createProduct(parent, args, ctx, info){
            console.log("Products Args", args)
            const product = await prisma.product.create({
                data:{
                    vendor_id: args?.vendor_id,
                name: args.data.name,
                description: args.data.description,
                price: args.data.price,
            }
            })
            s3ImageUpload(args.data.imageFile)
            for (let i = 0; i < args.data.categories.length; i++){
                await prisma.categoryProduct.create({
                    data: {
                        product_id: product?.id,
                        category_id: args.data.categories[i]
                    }
                })
            }
            
            return product
        },
        async createCategory(parent, args, ctx, info){
            const category = await prisma.category.create({
                data:{
                name: args.data.name
            }
            })
            console.log(category)
            return {category, message: "Successful"}
        },
        async deleteProduct(parent, args, ctx, info){
            const productExist = await prisma.product.findUnique({ where: { id: args.id } })
            if (!productExist) throw new Error("Product does not exist")
            const product = await prisma.product.delete({
                where:{
                id: args.id
            }
            })
            return product
        },
        async updateVendor(parent, args, ctx, info){
            const VendorExist = await prisma.vendor.findUnique({ where: { id: args.id } })
            if(args.data.password){
                args.data.password = await bcrypt.hash(args.data.password, 10);
            }
            if (!VendorExist) throw new Error("Vendor does not exist")
            const vendor = await prisma.vendor.update({
                where:{
                id: args.id
            }, data:{
                ...args.data
            }
            })
            return vendor
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}: any): Promise<any>  => {
        const bearerToken = String(req.headers.authorization)
        const token = bearerToken.split("Bearer ")[1]
        const currenUserId = await vendorIdFromToken(token)
        return{
            currenUserId: currenUserId?.userId
        }  
    }
})

server.listen(`${port}`).then(({url}) => console.log(`Server is running at ${url}`))