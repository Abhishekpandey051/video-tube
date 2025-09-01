import { Router } from "express";
import { getAllVideo, publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.midleware.js";

const router = Router();

router.route("/watch").get(getAllVideo)

router.route("/publish").post(
    upload.fields(
        [
            {
                name:"videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]
    ),
    publishVideo
)

export default router