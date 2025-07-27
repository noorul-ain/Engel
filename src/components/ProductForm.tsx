"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import ImageUpload from "./ImageUpload";
import { addProduct, updateProduct } from "../lib/products";
import { Product } from "../types/product";

// Define product schema with Zod
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  status: z.enum(["In Stock", "Out of Stock"]),
  excerpt: z.string().max(500, "Description must be less than 500 characters"),
  isVisible: z.boolean(),
  imageUrl: z.string().min(1, "Product image is required"),
  category: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

export default function ProductForm({
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useRef<Toast>(null);

  // Status options for dropdown
  const statusOptions = [
    { label: "In Stock", value: "In Stock" },
    { label: "Out of Stock", value: "Out of Stock" },
  ];

  // Set up form with default values
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: product.price,
          status: product.status,
          excerpt: product.excerpt,
          isVisible: product.isVisible,
          imageUrl: product.imageUrl,
          category: product.category || "",
        }
      : {
          name: "",
          price: 0,
          status: "In Stock",
          excerpt: "",
          isVisible: true,
          imageUrl: "",
          category: "",
        },
  });

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      if (product) {
        // Update existing product
        await updateProduct(product.id, data);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Product updated successfully",
        });

        if (onSuccess) {
          onSuccess({ ...data, id: product.id } as Product);
        }
      } else {
        // Add new product
        const newProductId = await addProduct(data);
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Product added successfully",
        });

        if (onSuccess) {
          onSuccess({ ...data, id: newProductId } as Product);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUploaded = (imageUrl: string) => {
    setValue("imageUrl", imageUrl, { shouldValidate: true });
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Name */}
        <div className="field">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Name*
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputText
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                className={`w-full ${errors.name ? "p-invalid" : ""}`}
              />
            )}
          />
          {errors.name && (
            <small className="p-error">{errors.name.message}</small>
          )}
        </div>

        {/* Price */}
        <div className="field">
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price*
          </label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <InputNumber
                id={field.name}
                value={field.value}
                onValueChange={(e) => field.onChange(e.value)}
                mode="currency"
                currency="USD"
                className={`w-full ${errors.price ? "p-invalid" : ""}`}
              />
            )}
          />
          {errors.price && (
            <small className="p-error">{errors.price.message}</small>
          )}
        </div>

        {/* Status */}
        <div className="field">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status*
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                id={field.name}
                value={field.value}
                options={statusOptions}
                onChange={field.onChange}
                className={`w-full ${errors.status ? "p-invalid" : ""}`}
              />
            )}
          />
          {errors.status && (
            <small className="p-error">{errors.status.message}</small>
          )}
        </div>

        {/* Category */}
        <div className="field">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <InputText
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                className="w-full"
              />
            )}
          />
        </div>

        {/* Image Upload */}
        <div className="field">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image*
          </label>
          <ImageUpload
            initialImageUrl={product?.imageUrl}
            onImageUploaded={handleImageUploaded}
            className="w-full"
          />
          {errors.imageUrl && (
            <small className="p-error">{errors.imageUrl.message}</small>
          )}
        </div>

        {/* Description */}
        <div className="field">
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <Controller
            name="excerpt"
            control={control}
            render={({ field }) => (
              <InputTextarea
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                rows={4}
                className={`w-full ${errors.excerpt ? "p-invalid" : ""}`}
              />
            )}
          />
          {errors.excerpt && (
            <small className="p-error">{errors.excerpt.message}</small>
          )}
        </div>

        {/* Visibility */}
        <div className="field-checkbox">
          <Controller
            name="isVisible"
            control={control}
            render={({ field }) => (
              <div className="flex items-center">
                <Checkbox
                  inputId={field.name}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.checked)}
                />
                <label
                  htmlFor={field.name}
                  className="ml-2 text-sm text-gray-700"
                >
                  Visible to customers
                </label>
              </div>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={onCancel}
              disabled={isSubmitting}
            />
          )}
          <Button
            type="submit"
            label={product ? "Update Product" : "Add Product"}
            icon="pi pi-save"
            loading={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}
