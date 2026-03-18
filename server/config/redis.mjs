import {createClient} from "redis";

const redisClient = createClient();

redisClient.on("error" , (err) => {
    console.log("Redis client error" , err)
    process.exit(1);
})

await redisClient.connect();

export default redisClient