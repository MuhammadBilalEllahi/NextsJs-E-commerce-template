import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { uploadFileToS3 } from '@/lib/utils/aws/aws';

interface UploadResult {
  url: string;
  mimetype: string;
}

/**
 * Uploads files to S3
 * @param uploadAWSPath - The aws path to upload the files to
 * @param files - The file or files to upload
 * @param uploadFolderId - The folder ID to upload the files to
 * @returns The uploaded files
 */
export async function uploaderFiles(
  uploadAWSPath: string,
  files: File | File[],
  uploadFolderId: string // E.g. product ID or any identifier to be used in the S3 path
): Promise<UploadResult[]> {
  const fileArray = Array.isArray(files) ? files : [files];
  const uploadedFiles: UploadResult[] = [];

  const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
  await mkdir(uploadDir, { recursive: true });

  for (const file of fileArray) {
    if (!(file instanceof Blob)) continue;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalFilename = (file as any).name || `file-${Date.now()}.dat`;
    const fileExt = path.extname(originalFilename) || '.dat';
    const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const tempFileName = `temp-${Date.now()}-${safeFilename}`;
    const tempFilePath = path.join(uploadDir, tempFileName);

    await writeFile(tempFilePath, buffer);

    const mimetype = (file as any).type || 'application/octet-stream';

    const url = await uploadFileToS3(
      {
        filepath: tempFilePath,
        originalFilename,
        mimetype
      },
      `${uploadAWSPath}/${uploadFolderId}`
    );

    uploadedFiles.push({ url, mimetype });
  }

  return uploadedFiles;
}
