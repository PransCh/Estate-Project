import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from './routes/user.route.js';
dotenv.config();

const app = express();
app.listen(2140, () => {
  console.log("Server is Running on 2140!!!");
});
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

  app.use('/api/user', userRouter);