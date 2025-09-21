import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../model/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// like and unlike video - API
const toggleLikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }
  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
      );
  }

  const newLike = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (!newLike) {
    throw new ApiError(500, "Something went wrong while liking the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Video liked successfully"));
});

// Like and unlike comment - API
const toggleLikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }
  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLiked: false }, "Unlike comment successfull")
      );
  }
  const likeComment = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (!likeComment) {
    throw new ApiError(500, "Something went wrong while like the comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Comment like successsfull"));
});

// like and unlike tweet
const toggleLikeTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id");
  }
  const alreadyLikedTweet = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (alreadyLikedTweet) {
    await Like.findByIdAndDelete(alreadyLikedTweet?._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false },
          "Unlike your tweet successfull"
        )
      );
  }
  const likeTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (!likeTweet) {
    throw new ApiError(500, "Something went wrong while liking tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Tweet like successfull"));
});

// get like like video - API
const getLikedVideo = asyncHandler(async (req, res) => {
  const likedVideosAggegate = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$likedVideo",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedVideo: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          owner: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
          isPublished: 1,
          ownerDetails: {
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideosAggegate,
        "liked videos fetched successfully"
      )
    );
});

export { toggleLikeVideo, toggleLikeComment, toggleLikeTweet, getLikedVideo };
