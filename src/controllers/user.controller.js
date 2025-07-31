import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../model/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res) => {
    const {username, email, fullname, password} = req.body

    if([username,email,password,fullname].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    } // we can also validate email with correct order... w'll do later

    const existedUser = User.find({
        $or: [{email},{username}]
    })
    
    if(existedUser){
        throw new ApiError(409, "User with emai or username already exists")
    }

    // check file uploaded on local
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files.coverImage[0].path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload local file on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // check avatar successfull uploaded on cloud 

    if(!avatar){
        throw new ApiError(400, "Avatar file is reuired")
    }

    User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage.url || "",
    })

    // check if user register, get that user in res, remove password and refreshtoke of that user

    const createdUser = await User.findById(User._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Someting went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User register successfully")
    )
    
})

export {registerUser}