import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  profile: "nodejs",
});

// const command = new ListBucketsCommand();
// const response = await s3Client.send(command);
// console.log(response);

import { CreateBucketCommand } from "@aws-sdk/client-s3";

// create
async function createBucket(bucketName) {
  const command = new CreateBucketCommand({
    Bucket: bucketName,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Bucket created:", response);
  } catch (err) {
    console.error("Error creating bucket:", err);
  }
}

// 🔍 3. READ (List Objects in Bucket)
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

async function listObjects(bucketName) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Objects:", response.Contents);
  } catch (err) {
    console.error("Error listing objects:", err);
  }
}


import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

// 4. CREATE (Upload Object)
async function uploadFile(bucketName, key, filePath) {
  const fileStream = fs.createReadStream(filePath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileStream,
  });

  try {
    const response = await s3Client.send(command);
    console.log("File uploaded:", response);
  } catch (err) {
    console.error("Upload error:", err);
  }
}


// READ (Download Object)
import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

async function downloadFile(bucketName, key, outputPath) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const stream = response.Body;

    const writeStream = fs.createWriteStream(outputPath);
    stream.pipe(writeStream);

    console.log("Download started...");
  } catch (err) {
    console.error("Download error:", err);
  }
}

// 6. UPDATE (Replace Object)

// 👉 S3 doesn’t have a true “update” — you just upload again with same key:

await uploadFile("my-bucket", "file.txt", "./newFile.txt");


// DELETE Object
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

async function deleteObject(bucketName, key) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Object deleted:", response);
  } catch (err) {
    console.error("Delete error:", err);
  }
}
// 🪣❌ 8. DELETE Bucket

// ⚠️ Bucket must be empty first

import { DeleteBucketCommand } from "@aws-sdk/client-s3";

async function deleteBucket(bucketName) {
  const command = new DeleteBucketCommand({
    Bucket: bucketName,
  });

  try {
    const response = await s3Client.send(command);
    console.log("Bucket deleted:", response);
  } catch (err) {
    console.error("Error deleting bucket:", err);
  }
}


// upload wth progress

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "fs";

const s3Client = new S3Client({
  profile: "nodejs",
});

const fileReadStream = createReadStream(
  "C:\\Users\\anura\\OneDrive\\Documents\\Premiere Pro\\to be edited\\nodejs-course\\section-18\\15_what-is-signed-url-in-s3.mp4"
);

const upload = new Upload({
  client: s3Client,
  params: {
    Bucket: "procodrr-nodejs-bucket",
    Key: "videos/what-is-signed-url-in-s3.mp4",
    Body: fileReadStream,
    ContentType: "video/mp4",
  },
});

upload.on("httpUploadProgress", (progress) => {
  process.stdout.write(
    `\r${((progress.loaded / progress.total) * 100).toFixed(2)}% Uploaded`
  );
});

const response = await upload.done();

console.log(response);

// this returns signed url

import { getSignedS3Url } from "./urlSigner.js";

const signedUrl = getSignedS3Url({
  bucketName: "procodrr-nodejs-bucket",
  objectKey: "img/backend.webp",
  method: 'GET',
  // contentType: 'image/png'x
});

console.log(signedUrl);
