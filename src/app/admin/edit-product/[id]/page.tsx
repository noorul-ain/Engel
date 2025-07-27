"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "../../../../components/ProductForm";
import { Product } from "../../../../types/product";
import { getProductById } from "../../../../lib/products";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await getProductById(params.id);

        if (!productData) {
          setError("Product not found");
          return;
        }

        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleSuccess = (updatedProduct: Product) => {
    // Navigate back to admin page after successful update
    router.push("/admin");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || "Product not found"}</p>
          <Link
            href="/admin"
            className="mt-2 inline-block text-red-700 underline"
          >
            Return to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Product: {product.name}
        </h1>
        <Link
          href="/admin"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <i className="pi pi-arrow-left mr-1"></i>
          <span>Back to Admin</span>
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <ProductForm product={product} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
