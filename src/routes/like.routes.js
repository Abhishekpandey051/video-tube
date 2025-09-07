import { Router } from "express";
import {
  getLikedVideo,
  toggleLikeComment,
  toggleLikeTweet,
  toggleLikeVideo,
} from "../controllers/like.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/video/:videoId").post(verifyJwt, toggleLikeVideo);
router.route("/comment/:commentId").post(verifyJwt, toggleLikeComment);
router.route("/tweet/:twetId").post(verifyJwt, toggleLikeTweet);
router.route("/").get(verifyJwt, getLikedVideo);

export default router;
