import JWT from "jsonwebtoken"

const vendorIdFromToken = (token: string) =>{
      try {
         return JWT.verify(token, "secret") as {
            userId: string
         }
      }
      catch (err) {
      }
 
}
export default vendorIdFromToken