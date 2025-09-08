import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { addTweet, deleteTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/").post(verifyJwt, addTweet);
router.route("/update/:tweetId").patch(verifyJwt, updateTweet)
router.route("/delete/:tweetId").delete(verifyJwt, deleteTweet)

export default router;
