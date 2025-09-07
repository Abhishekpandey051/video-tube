import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


const toggleLikeVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id");
    }
    

} )

export {toggleLikeVideo}