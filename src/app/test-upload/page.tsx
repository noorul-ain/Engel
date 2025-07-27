"use client";

import { useState } from "react";
import ImageUpload from "../../components/ImageUpload";
import Link from "next/link";

export default function TestUploadPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const handleImageUploaded = (url: string) => {
    setUploadedUrl(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Test Image Upload</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <i className="pi pi-arrow-left mr-1"></i>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Upload an Image</h2>

        <div className="max-w-md">
          <ImageUpload onImageUploaded={handleImageUploaded} />
        </div>

        {uploadedUrl && (
          <div className="mt-6">
            <h3 className="text-md font-medium mb-2">Uploaded Image URL:</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 break-all">
              <code>{uploadedUrl}</code>
            </div>

            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Preview:</h3>
              <img
                src={uploadedUrl}
                alt="Uploaded preview"
                className="max-w-full h-auto max-h-64 border border-gray-200 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
