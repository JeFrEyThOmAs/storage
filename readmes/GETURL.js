import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ profile: "nodejs" });

const command = new GetObjectCommand({
  Bucket: "procodrr-nodejs-bucket",
  Key: "img/backend.webp",
});

const url = await getSignedUrl(s3Client, command, {
  expiresIn: 3600,
});

console.log(url);
