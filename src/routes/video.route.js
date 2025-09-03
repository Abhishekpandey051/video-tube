import { Router } from "express";
import {
  deleteVideo,
  getAllVideo,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVedioDetail,
} from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.midleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(getAllVideo);

router.route("/publish").post(
  verifyJwt,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router
  .route("/watch/:videoId")
  .get(verifyJwt, getVideoById)
  .patch(verifyJwt, upload.single("thumbnail"), updateVedioDetail)
  .delete(verifyJwt, deleteVideo);

router.route("/publish/:videoId").patch(verifyJwt, togglePublishStatus);

export default router;
