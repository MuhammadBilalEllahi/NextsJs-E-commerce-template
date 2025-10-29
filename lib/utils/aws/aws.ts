import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { API_URL_CATEGORY_ADMIN } from "@/lib/api/admin/category/categories";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(file: any, folder = "categories") {
  try {
    const filePath = file.filepath || file.path;
    if (!filePath) throw new Error("File path is missing");

    const originalName = file.originalFilename || "file.jpg";
    const fileStream = fs.createReadStream(filePath);
    const ext = path.extname(originalName);
    const fileName = `${folder}/${Date.now()}${ext}`;

    // Get file stats to determine content length
    const fileStats = fs.statSync(filePath);
    const fileContent = fs.readFileSync(filePath); // Read entire file into buffer

    console.debug("Uploading file:", filePath);
    console.debug("File size:", fileStats.size, "bytes");

    const letsSEE = await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: fileName,
        // Body: fileStream,
        Body: fileContent, // Use buffer instead of stream
        ContentType: file.mimetype || "application/octet-stream",
        ContentLength: fileStats.size,
        ACL: "public-read-write", //give ACL access in aws website
      })
    );

    // console.debug("FILE in aws [letsSEE]", letsSEE)

    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (err: any) {
    console.error("S3 upload failed:", err);
    throw new Error(`S3 upload error: ${err.message}`);
  }
}

// export async function uploadCategoryImage(file: File) {
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await fetch(`${API_URL_CATEGORY_ADMIN}/upload`, {
//     method: "POST",
//     body: formData,
//   });

//   const data = await res.json();
//   if (!data.success) throw new Error(data.error);
//   return data.url; // S3 URL of uploaded image
// }
