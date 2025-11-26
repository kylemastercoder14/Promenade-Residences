import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Initialize S3 client
const getS3Client = () => {
  return new S3Client({
    region: "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY || "",
    },
  });
};

export async function upload(
  file: File,
  progressCallback?: (progress: number) => void
) {
  try {
    const s3Client = getS3Client();
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;

    const file_key = `uploads/${Date.now().toString()}_${file.name.replace(
      / /g,
      "-"
    )}`;

    // Use Upload from @aws-sdk/lib-storage for progress tracking
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: file_key,
        Body: file,
      },
    });

    // Track upload progress
    if (progressCallback) {
      upload.on("httpUploadProgress", (progress) => {
        if (progress.total) {
          const percentCompleted = Math.round(
            ((progress.loaded || 0) / progress.total) * 100
          );
          progressCallback(percentCompleted);
        }
      });
    }

    await upload.done();

    console.log("Successfully uploaded to S3:", file_key);

    const url = `https://${bucketName}.s3.ap-southeast-2.amazonaws.com/${file_key}`;
    return { url };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

export async function uploadFile(
  file: File,
  progressCallback?: (progress: number) => void
) {
  try {
    const s3Client = getS3Client();
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;

    const file_key = `ecr/${Date.now().toString()}_${file.name.replace(
      / /g,
      "-"
    )}`;

    // Use Upload from @aws-sdk/lib-storage for progress tracking
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: file_key,
        Body: file,
      },
    });

    // Track upload progress
    if (progressCallback) {
      upload.on("httpUploadProgress", (progress) => {
        if (progress.total) {
          const percentCompleted = Math.round(
            ((progress.loaded || 0) / progress.total) * 100
          );
          progressCallback(percentCompleted);
        }
      });
    }

    await upload.done();

    console.log("Successfully uploaded to S3:", file_key);

    const url = `https://${bucketName}.s3.ap-southeast-2.amazonaws.com/${file_key}`;
    return { url };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

/**
 * Delete a file from AWS S3.
 * @param {string} fileKey - The key of the file to delete in S3.
 * @returns {Promise<{ success: boolean; message: string }>} - Response indicating success or failure.
 */
export async function deleteImage(
  fileKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    const s3Client = getS3Client();
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: `/uploads/${fileKey}`,
    });

    await s3Client.send(command);

    console.log(`Successfully deleted file: ${fileKey}`);
    return { success: true, message: `File ${fileKey} deleted successfully.` };
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return { success: false, message: "Error deleting file from S3." };
  }
}

export async function deleteFromS3(fullUrl: string) {
  try {
    const s3Client = getS3Client();
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;

    // Extract the key from the full URL
    const bucketUrl = `https://${bucketName}.s3.ap-southeast-2.amazonaws.com/`;
    if (!fullUrl.startsWith(bucketUrl)) {
      throw new Error("Invalid S3 URL. URL does not match bucket.");
    }

    const key = fullUrl.replace(bucketUrl, "");
    console.log("Key:", key);
    if (!key) {
      return { error: "Invalid S3 URL. Key could not be extracted." };
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return { success: "Successfully removed video from s3." };
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return { error: "Failed to delete video from s3." };
  }
}
