import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../model/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  const content = await Comment.create({
    content: comment,
    owner: req.user._id,
    video: videoId,
  });

  const getComment = await Comment.findById(content._id);
  if (!getComment) {
    throw new ApiError(500, "Something went wrong while updating");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, getComment, "Comment added successfully"));
});

// get all comment - Api
const getAllComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }
  const getComment = await Comment.aggregate([
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
        $addFields: {
            content: "$content",
            username: { $arrayElemAt: ["$owner.username", 0] },
            fullname: { $arrayElemAt: ["$owner.fullname", 0] }
        }
    },
    {
      $project: {
        username: 1,
        content: 1,
        video: 1,
        fullname: 1,
      },
    },
  ]);
  if (!getComment) {
    throw new ApiError(404, "Comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, getComment, "Comment fetched successfully"));
});

// update comment - API
const updateComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { commentId } = req.params;
  if (!comment)
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid comment Id");
    }
  const getComment = await Comment.findById(commentId);
  if (!getComment) {
    throw new ApiError(404, "Comment not found");
  }
  if (getComment?.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "You are not authorized to update comment");
  }
  getComment.content = comment;
  const updatedComment = await getComment.save({ validateBeforeSave: false });
  if (!updatedComment) {
    throw new ApiError(500, "failed to update your comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comment: getComment?.content },
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
    throw new ApiError(404, "You are not authorized");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(500, "failed to delete your comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Delete comment sucessfully"));
});

export { postCommnetOnVideo, getAllComment, updateComment, deleteComment };
