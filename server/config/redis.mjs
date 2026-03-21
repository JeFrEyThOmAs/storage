import "dotenv/config";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_CONNECTION_STRING,
});

redisClient.on("error", (err) => {
  console.log("Redis client error:", err);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;