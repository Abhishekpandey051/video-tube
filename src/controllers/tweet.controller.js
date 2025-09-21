import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";
import mongoose, { isValidObjectId, set } from "mongoose";

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
  const { tweetId } = req.params;
  const { tweet } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const gettweet = await Tweet.findById(tweetId);
  if (!gettweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (gettweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }
  const newTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: tweet,
      },
    },
    {
      new: true,
    }
  );

  if (!newTweet) {
    throw new ApiError(500, "Something went wrong while updating tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet updated successfully"));
});

// Delete tweet - API
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const getTweet = await Tweet.findById(tweetId);
  if (!getTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (getTweet?.owner.toString() !== req?.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(500, "Something went wrong while deleting tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

// Get all tweet - API
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails",
                },
                ownerDetails: {
                    $first: "$ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});
export { addTweet, updateTweet, deleteTweet, getUserTweets };
