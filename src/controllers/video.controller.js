import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../model/video.model.js";
import { isValidObjectId, mongoose } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// get all video - API
const getAllVideo = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const pipeline = [];
  // Logic to fetch videos from the database with pagination, filtering, and sorting

  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    });
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // fetch video only that are set isPublished is set
  pipeline.push({
    $match: {
      isisPublished: true,
    },
  });

  //sortBy can be views, createdAt, duration
  //sortType can be ascending(-1) or descending(1)
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
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
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

// get video, upload on cloudinary, create video
const publishVideo = asyncHandler(async (req, res) => {
  const {title, description} = req.body;

  if([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFieldLocalPath = req.files?.videoFile[0]?.path;
  const thumbnaiFieldLocalPath = req.files?.thumbnail[0].path;
console.log(videoFieldLocalPath, "Thumbnail", thumbnaiFieldLocalPath)

  if(!videoFieldLocalPath) {
    throw new ApiError(400, "Video field is required")
  }
  if(!thumbnaiFieldLocalPath) {
    throw new ApiError(400, "Thumbnail field is required")
  }

  const videoFile = await uploadOnCloudinary(videoFieldLocalPath)
  const thumbnail = await uploadOnCloudinary(thumbnaiFieldLocalPath);

  if(!videoFile) {
    throw new ApiError(500, "Failed to upload video file")
  }
  if(!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail file")
  }
  console.log(videoFile)
  return res.ok

  const video = await Video.create(
    {
      title,
      description,
      owner: req.user,_id,
      isPublished: false,
      
    }
  )

})

export { getAllVideo, publishVideo };
