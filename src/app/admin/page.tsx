"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import {
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../../lib/products";
import { Product } from "../../types/product";
import ProductModal from "../../components/ProductModal";
import Link from "next/link";

// Define categories for filtering
const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Home & Kitchen", value: "home" },
  { label: "Books", value: "books" },
  { label: "Sports", value: "sports" },
];

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    visible: 0,
  });
  const toast = useRef<Toast>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate stats whenever products change
  useEffect(() => {
    const newStats = {
      total: products.length,
      inStock: products.filter((p) => p.status === "In Stock").length,
      outOfStock: products.filter((p) => p.status === "Out of Stock").length,
      visible: products.filter((p) => p.isVisible).length,
    };
    setStats(newStats);
  }, [products]);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load products. Please try again later.");
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load products",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on category and global search
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = globalFilter
      ? product.name.toLowerCase().includes(globalFilter.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Handle visibility toggle
  const handleVisibilityToggle = async (product: Product) => {
    try {
      const updatedVisibility = !product.isVisible;
      await updateProduct(product.id, { isVisible: updatedVisibility });

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === product.id ? { ...p, isVisible: updatedVisibility } : p
        )
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Product visibility ${
          updatedVisibility ? "enabled" : "disabled"
        }`,
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update product visibility",
        life: 3000,
      });
    }
  };

  // Handle product deletion
  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== product.id)
      );

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Product deleted successfully",
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete product",
        life: 3000,
      });
    }
  };

  // Handle modal actions
  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("view");
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setTimeout(() => {
      setSelectedProduct({
        id: "",
        name: "",
        price: 0,
        imageUrl: "",
        status: "In Stock",
        excerpt: "",
        isVisible: true,
        category: "electronics", // Default category
      });
      setModalMode("add");
    }, 0);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setModalMode("edit");
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  // Handle product update from modal
  const handleProductUpdate = (updatedProduct: Product) => {
    if (modalMode === "add") {
      setProducts((prevProducts) => [...prevProducts, updatedProduct]);
    } else if (modalMode === "edit") {
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === updatedProduct.id ? updatedProduct : p
        )
      );
    }
  };

  // Template for price column
  const priceBodyTemplate = (product: Product) => {
    return (
      <div className="text-center">
        <span className="font-semibold text-gray-900">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(product.price)}
        </span>
      </div>
    );
  };

  // Template for status column
  const statusBodyTemplate = (product: Product) => {
    const isInStock = product.status === "In Stock";
    return (
      <div className="flex justify-center">
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
            isInStock
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              isInStock ? "bg-emerald-500" : "bg-red-500"
            }`}
          ></div>
          {product.status}
        </div>
      </div>
    );
  };

  // Template for category column
  const categoryBodyTemplate = (product: Product) => {
    const category = CATEGORIES.find((c) => c.value === product.category);
    return (
      <div className="text-center">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-700">
          {category?.label || product.category}
        </span>
      </div>
    );
  };

  // Template for image column
  const imageBodyTemplate = (product: Product) => {
    return (
      <div className="flex justify-center">
        {product.imageUrl ? (
          <div className="relative group">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-xl object-cover shadow-sm"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200"></div>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <i className="pi pi-image text-gray-400 text-lg"></i>
          </div>
        )}
      </div>
    );
  };

  // Template for visibility toggle
  const visibilityBodyTemplate = (product: Product) => {
    return (
      <div className="flex justify-center">
        <div
          className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out cursor-pointer"
          onClick={() => handleVisibilityToggle(product)}
        >
          <div
            className={`w-11 h-6 rounded-full transition-colors duration-200 ${
              product.isVisible ? "bg-emerald-500" : "bg-gray-300"
            }`}
          ></div>
          <div
            className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
              product.isVisible ? "translate-x-6" : "translate-x-1"
            }`}
          ></div>
        </div>
      </div>
    );
  };

  // Template for action buttons
  const actionBodyTemplate = (product: Product) => {
    return (
      <div className="flex justify-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => openViewModal(product)}
          className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200"
          title="View"
        >
          <i className="pi pi-eye text-sm"></i>
        </motion.button>

        <Link href={`/admin/edit-product/${product.id}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-200"
            title="Edit"
          >
            <i className="pi pi-pencil text-sm"></i>
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDelete(product)}
          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
          title="Delete"
        >
          <i className="pi pi-trash text-sm"></i>
        </motion.button>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-gray-900">
            Loading Dashboard
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we fetch your data...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="pi pi-exclamation-triangle text-red-500 text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <i className="pi pi-refresh mr-2"></i>
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toast ref={toast} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/">
                <motion.button
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                >
                  <i className="pi pi-arrow-left mr-2"></i>
                  Back to Home
                </motion.button>
              </Link>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/admin/add-product">
                <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <i className="pi pi-plus mr-2"></i>
                  Add Product
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Products
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </h3>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="pi pi-shopping-bag text-white text-xl"></i>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  In Stock
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.inStock}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Available</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="pi pi-check-circle text-white text-xl"></i>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Out of Stock
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.outOfStock}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Unavailable</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="pi pi-times-circle text-white text-xl"></i>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Visible
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats.visible}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Public</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="pi pi-eye text-white text-xl"></i>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Filters & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search text-gray-400" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                />
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Dropdown
                value={selectedCategory}
                options={CATEGORIES}
                onChange={(e) => setSelectedCategory(e.value)}
                placeholder="Select Category"
                className="w-full rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Dropdown
                value="all"
                options={[
                  { label: "All Status", value: "all" },
                  { label: "In Stock", value: "inStock" },
                  { label: "Out of Stock", value: "outOfStock" },
                ]}
                placeholder="Select Status"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Product Inventory
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredProducts.length} of {products.length} products
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live data</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable
              value={filteredProducts}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              emptyMessage={
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="pi pi-search text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setGlobalFilter("");
                      setSelectedCategory("all");
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              }
              dataKey="id"
              responsiveLayout="scroll"
              className="p-datatable-products"
              stripedRows
              showGridlines={false}
              sortMode="multiple"
              removableSort
            >
              <Column
                field="imageUrl"
                header="Image"
                body={imageBodyTemplate}
                style={{ minWidth: "8rem" }}
              />
              <Column
                field="name"
                header="Product Name"
                sortable
                style={{ minWidth: "16rem" }}
              />
              <Column
                field="price"
                header="Price"
                body={priceBodyTemplate}
                sortable
                style={{ minWidth: "10rem" }}
              />
              <Column
                field="category"
                header="Category"
                body={categoryBodyTemplate}
                sortable
                style={{ minWidth: "12rem" }}
              />
              <Column
                field="status"
                header="Status"
                body={statusBodyTemplate}
                sortable
                style={{ minWidth: "10rem" }}
              />
              <Column
                field="isVisible"
                header="Visibility"
                body={visibilityBodyTemplate}
                style={{ minWidth: "12rem" }}
              />
              <Column
                body={actionBodyTemplate}
                header="Actions"
                style={{ minWidth: "12rem" }}
              />
            </DataTable>
          </div>
        </motion.div>
      </div>

      {/* Product Modal */}
      <ProductModal
        mode={modalMode}
        product={selectedProduct}
        onClose={closeModal}
        userType="admin"
        onProductUpdate={handleProductUpdate}
      />
    </div>
  );
}
