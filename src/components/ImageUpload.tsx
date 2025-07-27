"use client";

import { useState, useRef, ChangeEvent } from "react";

interface ImageUploadProps {
  initialImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUpload({
  initialImageUrl,
  onImageUploaded,
  className = "",
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || "");
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl || "");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Reset states
      setError(null);
      setIsUploading(true);

      // Generate preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Create form data for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "engel_preset");

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dihetcbod/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary error:", errorData);
        throw new Error(
          `Upload failed: ${errorData.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      setImageUrl(data.secure_url);
      onImageUploaded(data.secure_url);
    } catch (err: any) {
      console.error("Error during image upload:", err);
      setError(`Failed to upload image: ${err.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={triggerFileInput}
        style={{ height: "200px" }}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-full object-contain"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-gray-400 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Click to upload image</p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to 10MB
            </p>
            {isUploading && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {previewUrl && !isUploading && (
        <button
          type="button"
          onClick={triggerFileInput}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Change image
        </button>
      )}
    </div>
  );
}
