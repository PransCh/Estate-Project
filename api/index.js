import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
dotenv.config();

const app = express();
app.use(express.json());

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
// Getting routes from controllers and routes
// controllers contain response functions for controlling the routing
  app.use('/api/user', userRouter);
  app.use('/api/auth', authRouter);