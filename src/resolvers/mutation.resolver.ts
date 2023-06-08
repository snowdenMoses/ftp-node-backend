import { prisma } from "../server"
import bcrypt from "bcrypt"
import { Vendor } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken"
import s3ImageUpload from "../helperMethods/aws"

export const Mutation = {
        async uploadFile(parent, { file }){
        const { createReadStream, filename, mimetype, encoding } = await file
        return { filename, mimetype, encoding }
    },
        async createVendor(parent, args, ctx, info){
        let password = ""
        args.data.password = await bcrypt.hash(args.data.password, 10);
        const emailExist = await prisma.vendor.findUnique({ where: { email: args.data.email } })
        if (emailExist) throw new Error("Email Already Exist")
        const vendor = await prisma.vendor.create({
            data: {
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

        return { vendorDetails, token, message: "You have successfully Logged in" }
    }, 
        async createProduct(parent, args, ctx, info){
        const product = await prisma.product.create({
            data: {
                vendor_id: args?.vendor_id,
                name: args.data.name,
                description: args.data.description,
                price: args.data.price,
            }
        })
        console.log("image", args.data.imageFile);

        s3ImageUpload(args.data.imageFile)
        for (let i = 0; i < args.data.categories.length; i++) {
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
            data: {
                name: args.data.name
            }
        })
        return { category, message: "Successful" }
    },
        async deleteProduct(parent, args, ctx, info){
        const productExist = await prisma.product.findUnique({ where: { id: args.id } })
        if (!productExist) throw new Error("Product does not exist")
        const product = await prisma.product.delete({
            where: {
                id: args.id
            }
        })
        return product
    },
        async updateVendor(parent, args, ctx, info){
        const VendorExist = await prisma.vendor.findUnique({ where: { id: args.id } })
        if (args.data.password) {
            args.data.password = await bcrypt.hash(args.data.password, 10);
        }
        if (!VendorExist) throw new Error("Vendor does not exist")
        const vendor = await prisma.vendor.update({
            where: {
                id: args.id
            }, data: {
                ...args.data
            }
        })
        return vendor
    },
}