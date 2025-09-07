import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../model/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../model/video.model.js";

// post comment on video - API
const postCommnetOnVideo = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { videoId } = req.params;
  if (!comment) {
    throw new ApiError(400, "Comment are required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const content = await Comment.create({
    content: comment,
    owner: req.user?._id,
    video: videoId,
  });

  if (!content) {
    throw new ApiError(500, "Failed to add comment please try again");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { comment: content }, "Comment added successfully")
    );
});

// get all comment - Api
const getAllComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const commentsAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullname: 1,
          avatar: 1,
        },
        isLiked: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// update comment - API
const updateComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { commentId } = req.params;
  if (!comment)
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment Id");
    }
  if (!comment) {
    throw new ApiError(400, "Comment is required");
  }
  const getComment = await Comment.findById(commentId);
  if (!getComment) {
    throw new ApiError(404, "Comment not found");
  }
  if (getComment?.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Only comment's owner can edit their comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    getAllComment?._id,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Failed to edit comment please try again!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment: updatedComment },
        "Update comment successfully"
      )
    );
});

// Delete comment - API
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Inavlid comment Id");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(404, "Only commet's owner can delete their comment");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({
    comment: commentId,
    likedBy: req.user,
  });

  if (!deletedComment) {
    throw new ApiError(500, "failed to delete your comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment: deletedComment.content },
        "Delete comment sucessfully"
      )
    );
});

export { postCommnetOnVideo, getAllComment, updateComment, deleteComment };
