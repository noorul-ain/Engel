// Remove the server-side cloudinary import and config
// and use direct fetch API for browser uploads

/**
 * Upload a file to Cloudinary
 * @param file - The file to upload
 * @returns Promise with the upload result
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);

    // Create a FormData object
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "engel_preset");

    // Make the upload request to Cloudinary with hardcoded cloud name
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dihetcbod/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Convert a file to base64 string
 * @param file - The file to convert
 * @returns Promise with the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generate a preview URL for an image file
 * @param file - The image file
 * @returns Promise with the preview URL
 */
export const generateImagePreview = async (file: File): Promise<string> => {
  try {
    return await fileToBase64(file);
  } catch (error) {
    console.error("Error generating image preview:", error);
    throw error;
  }
};
