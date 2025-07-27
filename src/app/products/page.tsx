"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
import { Button } from "primereact/button";
import { ToggleButton } from "primereact/togglebutton";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  getAllProducts,
  updateProduct,
  deleteProduct,
} from "../../lib/products";
import { Product } from "../../types/product";
import ProductModal from "../../components/ProductModal";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const toast = useRef<Toast>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);

      // Set initial price range based on product data
      if (data.length > 0) {
        const prices = data.map((p) => p.price);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange([minPrice, maxPrice]);
      }

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

  // Filter products based on price range and global search
  const filteredProducts = products.filter((product) => {
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = globalFilter
      ? product.name.toLowerCase().includes(globalFilter.toLowerCase())
      : true;
    return matchesPrice && matchesSearch;
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(product.price);
  };

  // Template for status column
  const statusBodyTemplate = (product: Product) => {
    const statusClassName =
      product.status === "In Stock"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusClassName}`}
      >
        {product.status}
      </span>
    );
  };

  // Template for visibility toggle
  const visibilityBodyTemplate = (product: Product) => {
    return (
      <motion.div whileTap={{ scale: 0.95 }}>
        <ToggleButton
          checked={product.isVisible}
          onChange={() => handleVisibilityToggle(product)}
          onLabel="Visible"
          offLabel="Hidden"
          className={
            product.isVisible ? "p-button-success" : "p-button-secondary"
          }
        />
      </motion.div>
    );
  };

  // Template for action buttons
  const actionBodyTemplate = (product: Product) => {
    return (
      <div className="flex gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            icon="pi pi-eye"
            rounded
            outlined
            className="p-button-info"
            onClick={() => openViewModal(product)}
            tooltip="View"
            tooltipOptions={{ position: "top" }}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            icon="pi pi-pencil"
            rounded
            outlined
            className="p-button-warning"
            onClick={() => openEditModal(product)}
            tooltip="Edit"
            tooltipOptions={{ position: "top" }}
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            icon="pi pi-trash"
            rounded
            outlined
            className="p-button-danger"
            onClick={() => handleDelete(product)}
            tooltip="Delete"
            tooltipOptions={{ position: "top" }}
          />
        </motion.div>
      </div>
    );
  };

  // Header with search and filters
  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div className="w-full sm:w-auto">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by name"
              className="w-full"
            />
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col w-full sm:w-64">
            <label className="mb-1">
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <Slider
              value={priceRange}
              onChange={(e) => setPriceRange(e.value as [number, number])}
              range
              min={0}
              max={1000}
              className="w-full"
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button
              label="Add Product"
              icon="pi pi-plus"
              className="p-button-success w-full"
              onClick={openAddModal}
            />
          </motion.div>
        </div>
      </div>
    );
  };

  const header = renderHeader();

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        <p className="mt-4 text-lg">Loading products...</p>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <div className="bg-red-100 p-6 rounded-lg text-center">
          <h2 className="text-red-800 text-xl mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <Toast ref={toast} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-6">Products</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <DataTable
          value={filteredProducts}
          header={header}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          emptyMessage="No products found"
          dataKey="id"
          responsiveLayout="scroll"
          className="p-datatable-products shadow-lg rounded-lg overflow-hidden"
          stripedRows
          showGridlines
          sortMode="multiple"
          removableSort
        >
          <Column
            field="name"
            header="Name"
            sortable
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="price"
            header="Price"
            body={priceBodyTemplate}
            sortable
            style={{ minWidth: "8rem" }}
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
            style={{ minWidth: "10rem" }}
          />
          <Column
            body={actionBodyTemplate}
            header="Actions"
            style={{ minWidth: "12rem" }}
          />
        </DataTable>
      </motion.div>

      {/* Product Modal */}
      <ProductModal
        mode={modalMode}
        product={selectedProduct}
        onClose={closeModal}
        userType="admin"
        onProductUpdate={handleProductUpdate}
      />
    </motion.div>
  );
}
