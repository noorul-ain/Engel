"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "../../../components/ProductForm";
import { Product } from "../../../types/product";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (product: Product) => {
    // Navigate back to admin page after successful product creation
    router.push("/admin");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <Link
          href="/admin"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <i className="pi pi-arrow-left mr-1"></i>
          <span>Back to Admin</span>
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <ProductForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
