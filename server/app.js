import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js"
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";

dotenv.config();

console.log("REDIS URL =>", process.env.REDIS_CONNECTION_STRING);

const secret = process.env.SECRET;
await connectDB();

const app = express();
app.use(cookieParser(secret));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const rateLimitStore = {};

function rateLimiter({ windowSize, numberOfRequests }) {
  return function (req, res, next) {
    const currentTime = Date.now();

    if (!rateLimitStore[req.ip]) {
      rateLimitStore[req.ip] = {
        startTime: currentTime,
        count: 1,
      };
      return next();
    }

    if (currentTime - rateLimitStore[req.ip].startTime > windowSize) {
      rateLimitStore[req.ip] = {
        startTime: currentTime,
        count: 1,
      };
    } else {
      rateLimitStore[req.ip].count++;

      if (rateLimitStore[req.ip].count > numberOfRequests) {
        return res
          .status(429)
          .json({ error: "Too many request. Slow down please." });
      }
    }
    console.log(rateLimitStore);
    next();
  };
}

const limiter = rateLimiter({
  windowSize: 60 * 1000,
  numberOfRequests: 50,
})

app.use(limiter);

app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth" , authRoutes)

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({ error: "Something went wrong!" });
});

app.listen(4000, () => {
  console.log(`Server Started`);
});
