import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

// import router
import userRegister from './routes/user.routes.js';
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js"


// routes declare
app.use("/user", userRegister)
app.use("/video", videoRouter)
app.use("/comment", commentRouter)
app.use("/like", likeRouter);
app.use("/tweet", tweetRouter)

export {app}