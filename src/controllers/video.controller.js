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

  const videoAggregate = await Video.aggregate(pipeline);

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
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoFieldLocalPath = req.files?.videoFile[0]?.path;
  const thumbnaiFieldLocalPath = req.files?.thumbnail[0].path;

  if (!videoFieldLocalPath) {
    throw new ApiError(400, "Video field is required");
  }
  if (!thumbnaiFieldLocalPath) {
    throw new ApiError(400, "Thumbnail field is required");
  }

  const videoFile = await uploadOnCloudinary(videoFieldLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnaiFieldLocalPath);

  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video file");
  }
  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail file");
  }

  const video = await Video.create({
    title,
    description,
    owner: req.user._id,
    isPublished: false,
    duration: videoFile?.duration,
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
  });

  const uploadedVideo = await Video.findById(video._id);
  if (!uploadedVideo) {
    throw new ApiError(500, "Something went wrong while uploading");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"));
});

// get video by id = API
const getVideoById = asyncHandler(async (req,res) => {
  const { videoId } = req.params;
  const userId = req.user;
  console.log("Videoid",videoId, "User iD",userId._id)

  if(!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId")
  }
  if(!isValidObjectId(userId._id)) {
    throw new ApiError(400, "Invalid userId")
  }

  const video = await Video.aggregate(
    [
      {
        $match: {
        _id: new mongoose.Types.ObjectId(videoId)
      }
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
              }
            },
            {
              $addFields: {
                subscriberCount: {
                  $size: $suscriber
                },
                isSubscribed: {
                  $cond: {
                    if: {
                      $in: [
                        req.user?._id,
                        "$subscribers.subscriber"
                      ]
                    },
                    then: true,
                    else: false
                  }
                }
              }
            },
            {
              $project: {
                username: 1,
                avatar:1,
                subscriberCount:1,
                isSubscribed:1
              }
            }
          ]
        }
      },
       {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                "videoFile.url": 1,
                title: 1,
                description: 1,
                views: 1,
                createdAt: 1,
                duration: 1,
                comments: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1
            }
        }
    ]);

    if(!video) {
      throw new ApiError(500, "failed to fetch video")
    }
    //increment the view if fetched successfull

    await Video.findByIdAndUpdate(videoId, {
      $inc: {
        views: 1
      }
    })

    // add this video to user watched history
    await Video.findByIdAndUpdate(userId._id, {
      $addToSet: {
        watchHistory: videoId
      }
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, video[0], "video details fetched successfully")
        );
});


export { getAllVideo, publishVideo, getVideoById };
