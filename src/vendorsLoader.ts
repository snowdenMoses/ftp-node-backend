import DataLoader from "dataloader";
import { prisma } from "./server";

async function  batchVendorFn (ids){
    const vendors = await prisma.vendor.findMany({
    where:{
        id:{
            in: ids
        }
    }
    })
    const vendorsMap = vendors.reduce((map, currentVendor) => {
        map[currentVendor.id] = currentVendor
        return map
    },{})

    return ids.map(id => vendorsMap[id])
}
export const cacheUser = new DataLoader(batchVendorFn)