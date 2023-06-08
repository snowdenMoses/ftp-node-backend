export const typeDefs = `#graphql
scalar Upload
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
    uploadFile(file: Upload!): File!
}
type File{
    filename: String
    mimetype: String
    encoding: String
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
# type Image{
#     lastModified: String
#     lastModifiedDate: String
#     name: String
#     size: String
#     type: String
#     webkitRelativePath: String
# }

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
    # vendor_id: String
    imageFile: Upload
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