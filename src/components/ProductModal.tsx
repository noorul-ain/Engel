"use client";

import { useRef, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product } from "../types/product";
import { theme } from "../styles/theme";
import { uploadFile, fileToDataUrl, isImageFile } from "../lib/storage";
import { addProduct, updateProduct } from "../lib/products";

// Define the form schema with Zod
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(1, "Price must be at least 1"),
  status: z.enum(["In Stock", "Out of Stock"]),
  isVisible: z.boolean(),
  imageUrl: z.string().optional(),
  excerpt: z.string().max(400, "Description must be less than 400 characters"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  mode: "view" | "add" | "edit";
  product: Product | null;
  onClose: () => void;
  userType: "admin" | "customer";
  onProductUpdate?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export default function ProductModal({
  mode,
  product,
  onClose,
  userType,
  onProductUpdate,
  onAddToCart,
}: ProductModalProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const dialogRef = useRef<Dialog>(null);
  const toastRef = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with react-hook-form and zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      status: "In Stock",
      isVisible: true,
      imageUrl: "",
      excerpt: "",
    },
  });

  // Status options for dropdown
  const statusOptions = [
    { label: "In Stock", value: "In Stock" },
    { label: "Out of Stock", value: "Out of Stock" },
  ];

  // Show modal with animation when product changes
  useEffect(() => {
    if (product) {
      setVisible(true);

      // If in edit mode, populate form with product data
      if (mode === "edit" && product) {
        reset({
          name: product.name,
          price: product.price,
          status: product.status,
          isVisible: product.isVisible,
          imageUrl: product.imageUrl,
          excerpt: product.excerpt,
        });
        setImagePreview(product.imageUrl);
      }
    } else {
      setVisible(false);
      // Reset form when modal closes
      reset();
      setImagePreview(null);
      setImageFile(null);
    }
  }, [product, mode, reset]);

  // Handle modal close
  const handleClose = () => {
    setVisible(false);
    // Delay the onClose callback to allow the animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Handle image file selection
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && isImageFile(file)) {
      setImageFile(file);

      try {
        // Generate preview
        const preview = await fileToDataUrl(file);
        setImagePreview(preview);
      } catch (error) {
        console.error("Error generating preview:", error);
        toastRef.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to generate image preview",
        });
      }
    } else if (file) {
      toastRef.current?.show({
        severity: "error",
        summary: "Invalid File",
        detail: "Please select a valid image file (JPEG, PNG, GIF)",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      // If there's a new image file, upload it first
      let imageUrl = data.imageUrl;

      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      // Combine form data with image URL
      const productData = {
        ...data,
        imageUrl: imageUrl || "",
      };

      if (mode === "add") {
        // Add new product
        const productId = await addProduct(productData);

        // Show success message
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Product added successfully",
        });

        // Notify parent component
        if (onProductUpdate) {
          onProductUpdate({
            id: productId,
            ...productData,
          });
        }
      } else if (mode === "edit" && product) {
        // Update existing product
        await updateProduct(product.id, productData);

        // Show success message
        toastRef.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Product updated successfully",
        });

        // Notify parent component
        if (onProductUpdate) {
          onProductUpdate({
            ...product,
            ...productData,
          });
        }
      }

      // Close modal after successful submission
      handleClose();
    } catch (error) {
      console.error("Error submitting product:", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding to cart
  const handleAddToCart = () => {
    if (product && onAddToCart) {
      onAddToCart(product, quantity);
      handleClose();
    }
  };

  // Custom header for the dialog
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center w-full p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "view"
              ? "Product Details"
              : mode === "add"
              ? "Add New Product"
              : "Edit Product"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === "view"
              ? "View product information"
              : mode === "add"
              ? "Create a new product"
              : "Update product information"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
        >
          <i className="pi pi-times text-gray-600"></i>
        </motion.button>
      </div>
    );
  };

  // Render the product view mode
  const renderViewMode = () => {
    if (!product) return null;

    return (
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Product Image */}
          <div className="w-full lg:w-2/5">
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-50 to-gray-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img
                src={product.imageUrl || "/placeholder-image.jpg"}
                alt={product.name}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm ${
                  product.status === "In Stock"
                    ? "bg-emerald-500/90 text-white"
                    : "bg-rose-500/90 text-white"
                }`}
              >
                {product.status}
              </div>
            </motion.div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-3/5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h3>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(product.price)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="prose prose-gray max-w-none"
            >
              <p className="text-gray-600 leading-relaxed">
                {product.excerpt ||
                  "No description available for this product."}
              </p>
            </motion.div>

            {/* Admin-only details */}
            {userType === "admin" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <h4 className="font-semibold text-gray-900 mb-3">
                  Admin Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Product ID
                    </p>
                    <p className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                      {product.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Visibility
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.isVisible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          product.isVisible ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {product.isVisible ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  {product.category && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">
                        Category
                      </p>
                      <p className="text-gray-900 capitalize">
                        {product.category}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Customer-only actions */}
            {userType === "customer" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                {product.status === "In Stock" ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Quantity:
                      </span>
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setQuantity((prev) => Math.max(1, prev - 1))
                          }
                          disabled={quantity <= 1}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="pi pi-minus"></i>
                        </motion.button>
                        <span className="px-4 py-2 font-semibold text-gray-900">
                          {quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <i className="pi pi-plus"></i>
                        </motion.button>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <i className="pi pi-shopping-cart"></i>
                      <span>Add to Cart</span>
                    </motion.button>
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <i className="pi pi-times-circle text-red-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-900">
                          Out of Stock
                        </h4>
                        <p className="text-sm text-red-700">
                          This product is currently unavailable
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // Render the product form for add/edit modes
  const renderFormMode = () => {
    return (
      <div className="p-6">
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Product Name*
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter product name"
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <i className="pi pi-exclamation-circle text-xs"></i>
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Price*
              </label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.price
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                )}
              />
              {errors.price && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <i className="pi pi-exclamation-circle text-xs"></i>
                  <span>{errors.price.message}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Status*
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    options={statusOptions}
                    optionLabel="label"
                    className={`w-full [&>*]:!rounded-xl [&>*]:!border-gray-200 [&>*]:!bg-gray-50 ${
                      errors.status
                        ? "[&>*]:!border-red-300 [&>*]:!bg-red-50"
                        : ""
                    }`}
                    placeholder="Select status"
                  />
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <i className="pi pi-exclamation-circle text-xs"></i>
                  <span>{errors.status.message}</span>
                </p>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Visibility
              </label>
              <Controller
                name="isVisible"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        field.value ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          field.value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-700">
                      {field.value
                        ? "Visible to customers"
                        : "Hidden from customers"}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Product Image
            </label>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image Preview */}
              <div className="w-full lg:w-1/3">
                <motion.div
                  className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 aspect-square flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <i className="pi pi-image text-4xl text-gray-400 mb-3"></i>
                      <p className="text-sm text-gray-500 font-medium">
                        No image selected
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Upload Controls */}
              <div className="w-full lg:w-2/3 flex flex-col justify-center space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center space-x-2 w-full py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 border-dashed rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <i className="pi pi-upload text-gray-600"></i>
                  <span className="font-medium text-gray-700">
                    Choose Image
                  </span>
                </motion.button>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Supported formats: JPEG, PNG, GIF
                  <br />
                  Maximum file size: 5MB
                  <br />
                  Recommended dimensions: 800x800px
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <Controller
              name="excerpt"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.excerpt
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Enter product description (max 400 characters)"
                />
              )}
            />
            {errors.excerpt && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <i className="pi pi-exclamation-circle text-xs"></i>
                <span>{errors.excerpt.message}</span>
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-check"></i>
                  <span>
                    {mode === "add" ? "Create Product" : "Update Product"}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toastRef} />
      <AnimatePresence>
        {visible && (
          <Dialog
            header={renderHeader}
            visible={visible}
            style={{ width: "95%", maxWidth: "900px" }}
            onHide={handleClose}
            dismissableMask
            draggable={false}
            resizable={false}
            className="[&_.p-dialog]:!rounded-2xl [&_.p-dialog]:!shadow-2xl [&_.p-dialog]:!border-0 [&_.p-dialog-header]:!p-0 [&_.p-dialog-content]:!p-0"
            ref={dialogRef}
          >
            <div className="bg-white rounded-2xl">
              {mode === "view" && renderViewMode()}
              {(mode === "add" || mode === "edit") && renderFormMode()}
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
