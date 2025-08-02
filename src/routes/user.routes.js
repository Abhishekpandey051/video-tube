import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToke, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.midleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";


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

router.route("/login").post(loginUser)

// secure routes

router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(refreshAccessToke)
router.route("/getuser").post(verifyJwt, getCurrentUser)


export default router