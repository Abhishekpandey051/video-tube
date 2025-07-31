import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({path:"./env"})


connectDB().then(()=>{
    app.on('error', (error) => {
        console.log("ERROR : ", error);
    })
    app.listen(process.env.PORT || 80000, ()=>{
        console.log(`Sever is running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb connection failed: ", err)
})