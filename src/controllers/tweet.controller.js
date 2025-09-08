import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";

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

export { addTweet };
