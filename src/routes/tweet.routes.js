import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { addTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/").post(verifyJwt, addTweet);

export default router;
