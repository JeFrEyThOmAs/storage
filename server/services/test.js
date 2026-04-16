import { createCloudFrontGetSignedUrl } from "./cloudfront.js";

const url = createCloudFrontGetSignedUrl({
    key: "_.jpeg",
    download: false,
    filename: "image.jpg",
  });
  
  console.log("SIGNED URL:\n", url);