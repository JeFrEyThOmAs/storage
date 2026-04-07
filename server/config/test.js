import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.js";

async function testS3() {
    try {
      const data = await s3Client.send(new ListBucketsCommand({}));
      console.log("✅ S3 Connected Successfully");
      console.log(data.Buckets);
    } catch (err) {
      console.error("❌ Error connecting to S3:", err);
    }
  }
  
testS3();