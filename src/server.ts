import { gql, ApolloServer } from "apollo-server";
import { PubSub } from "graphql-subscriptions";
import { PrismaClient, Vendor } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cacheUser } from "./vendorsLoader";
import currentUser from "./vendor/currentVendor";


const port = process.env.PORT || 4000
const pubSub = new PubSub()
export const prisma = new PrismaClient()

const typeDefs = gql`
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
`
const resolvers = {
    Query: {
        async vendor(parent:any, {id}:any, ctx:any, info:any){
            return await prisma.vendor.findUnique({where:{id}})
        },
        // async currentVendor(_: any, __: any, { token }:any, info:any){
        //     const userId = await jwt.verify(token, 'secret')
        //     console.log(userId)
        //     return await prisma.vendor.findUnique({ where: { id: userId }})
        // },
        async vendors(){
            return await prisma.vendor.findMany()
        },
        async products(){
            return  await prisma.product.findMany()
        }
    },
    Product:{
        vendor(parent, args, {userToken}, info){
            // return prisma.vendor.findUnique({where:{id: parent.vendor_id}})
            return cacheUser.load(parent.vendor_id)
        
            
        }
    },
    Vendor:{
        products(parent, args, ctx, info){
            return prisma.product.findMany({where: {vendor_id: parent.id}})
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
                data: vendorDetails?.id
            }, 'secret', { expiresIn: 60 * 60 });

            return { vendorDetails, token }
        }, 
        async createProduct(parent, args, ctx, info){
            const product = await prisma.product.create({
                data:{
                ...args.data,
                vendor_id: args.vendor_id
            }
            })
            return product
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
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req})=>{
        // console.log(req.headers.authorization)
        // return{
        //     token: req.headers.authorization,
        //     pubSub
        // }  
    }
}
)

server.listen(`${port}`).then(({url}) => console.log(`Server is running at ${url}`))