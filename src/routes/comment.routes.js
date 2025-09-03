import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  deleteComment,
  getAllComment,
  postCommnetOnVideo,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/post/:videoId").post(verifyJwt, postCommnetOnVideo);
router.route("/get-comment/:videoId").get(getAllComment);
router.route("/update/:commentId").patch(verifyJwt, updateComment);
router.route("/delete/:commentId").delete(verifyJwt, deleteComment);

export default router;
