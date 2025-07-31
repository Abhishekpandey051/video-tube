import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      reuired: true,
    },
    thumbnail: {
      type: String,
      reuired: true,
    },
    title: {
      type: String,
      reuired: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      reuired: true,
    },
    views: {
      type: String,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      reuired: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
