import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      (await req.cookies?.accessToken) ||
      req.header("Authorization")?.replace("Bearer ", ""); 
      // Here we handle if token have already then ok if not we pass token through header like mobile App.
      
      if(!token){
          throw new ApiError(401, "Unauthorized user")
      }
  
      const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
      const user = await User.findById(decodeToken._id).select("-password -refressToken")
      
      if(!user){
          throw new ApiError(401, "Invalid access Token")
      }
  
      req.user = user;
      next()
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access token")
  } 

});
