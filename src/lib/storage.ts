import { storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Upload a file to Firebase Storage
 * @param file File to upload
 * @param path Path in storage where the file should be stored
 * @returns Promise with download URL
 */
export const uploadFile = async (
  file: File,
  path: string = "products"
): Promise<string> => {
  try {
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileName = `${path}/${timestamp}_${file.name.replace(/\s+/g, "_")}`;

    // Create a reference to the storage location
    const storageRef = ref(storage, fileName);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Extract file extension from a file
 * @param file File object
 * @returns File extension (e.g., 'jpg', 'png')
 */
export const getFileExtension = (file: File): string => {
  return file.name.split(".").pop()?.toLowerCase() || "";
};

/**
 * Check if a file is an image
 * @param file File object
 * @returns Boolean indicating if the file is an image
 */
export const isImageFile = (file: File): boolean => {
  const validImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return validImageTypes.includes(file.type);
};

/**
 * Convert a file to a data URL for preview
 * @param file File object
 * @returns Promise with data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
