import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentChannelProfile,
  getCurrentUser,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToke,
  registerUser,
  updateAccoundDetail,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.midleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secure routes

router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToke);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/update-accounts").patch(verifyJwt, updateAccoundDetail);
router
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJwt, getCurrentChannelProfile);
router.route("/history").get(verifyJwt, getWatchHistory);

export default router;
