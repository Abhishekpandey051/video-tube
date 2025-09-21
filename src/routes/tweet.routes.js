import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/").post(verifyJwt, addTweet);
router.route("/update/:tweetId").patch(verifyJwt, updateTweet);
router.route("/delete/:tweetId").delete(verifyJwt, deleteTweet);
router.route("/:userId").get(verifyJwt, getUserTweets);

export default router;
