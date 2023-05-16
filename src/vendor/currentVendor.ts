import { prisma } from "../server"

const currentUser = async (userId) =>{
 return await prisma.vendor.findUnique({where:{
    id: userId
 }})
}

export default currentUser