import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
dotenv.config();


export const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
export const createUploadSignedUrl = async ({ key, contentType }) => {
    const command = new PutObjectCommand({
      Bucket: "storageappjeff",
      Key: key,
      ContentType: contentType,
    });
  
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
      signableHeaders: new Set(["content-type"]),
    });
  
    return url;
  };
  
  export const createGetSignedUrl = async ({
    key,
    download = false,
    filename,
  }) => {
    const command = new GetObjectCommand({
      Bucket: "storageappjeff",
      Key: key,
      ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename=${encodeURIComponent(filename)}`,
    });
  
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
  
    return url;
  };