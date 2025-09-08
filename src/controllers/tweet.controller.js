import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";
import { isValidObjectId } from "mongoose";

// post tweet on video - API
const addTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;
  if (!tweet) {
    throw new ApiError(400, "Tweet field are required");
  }
  const createTweet = await Tweet.create({
    content: tweet,
    owner: req.user?._id,
  });
  if (!createTweet) {
    throw new ApiError(500, "Something went wrong while adding tweet");
  }
  const getTweet = await Tweet.findById(createTweet._id);
  if (!getTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet added successfully"));
});

// update tweet - API
const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    const {tweet} = req.body;
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }
    const gettweet = await Tweet.findById(tweetId)
    if(!gettweet){
        throw new ApiError(404, "Tweet not found")
    }
    if(gettweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this tweet")
    }
    gettweet.content = tweet
    const updatedTweet = await gettweet.save({validateBeforeSave: false})
    if(!updatedTweet){
        throw new ApiError(500, "Something went wrong while updating tweet")
    }
    return res.status(200).json(new ApiResponse(200, {}, "Tweet updated successfully"))
})

// Delete tweet - API
const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }
    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deleteTweet){
        throw new ApiError(404, "Tweet not found")
    }
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export { addTweet, updateTweet, deleteTweet };
