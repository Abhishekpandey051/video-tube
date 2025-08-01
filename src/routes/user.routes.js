import { Router } from "express";
import { registerUser, userLogin } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.midleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(userLogin)

export default router