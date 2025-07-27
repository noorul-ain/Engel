"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Badge } from "primereact/badge";
import { Sidebar } from "primereact/sidebar";
import { getAllProducts } from "../../lib/products";
import { Product } from "../../types/product";
import ProductModal from "../../components/ProductModal";
import { theme } from "../../styles/theme";
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

// Cart item type
interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(true); // Only get visible products
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

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch && product.isVisible;
  });

  // View product details
  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  // Close product modal
  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  // Add product to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      // Check if product already in cart
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Update quantity if already in cart
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { product, quantity }];
      }
    });

    toast.current?.show({
      severity: "success",
      summary: "Added to Cart",
      detail: `${product.name} added to your cart`,
      life: 2000,
    });

    // Show cart sidebar
    setShowCart(true);
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  // Update cart item quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Calculate total cart items
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Checkout function
  const handleCheckout = () => {
    toast.current?.show({
      severity: "info",
      summary: "Checkout",
      detail: "Checkout functionality will be implemented soon!",
      life: 3000,
    });
  };

  // Render cart sidebar
  const renderCartSidebar = () => {
    return (
      <Sidebar
        visible={showCart}
        position="right"
        onHide={() => setShowCart(false)}
        className="p-sidebar-md"
        style={{ width: "400px" }}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 pb-2 border-b">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <span className="text-sm text-gray-500">{cartItemCount} items</span>
          </div>

          {cart.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="pi pi-shopping-cart text-4xl mb-4 text-gray-300"></i>
                <p className="text-gray-500 text-center">Your cart is empty</p>
                <Button
                  label="Continue Shopping"
                  icon="pi pi-arrow-left"
                  className="mt-4 p-button-outlined w-full"
                  onClick={() => setShowCart(false)}
                />
              </motion.div>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.product.id}
                      className="flex items-center gap-3 mb-4 pb-4 border-b"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative w-16 h-16 overflow-hidden rounded-lg">
                        <img
                          src={
                            item.product.imageUrl || "/placeholder-image.jpg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Button
                          icon="pi pi-minus"
                          className="p-button-rounded p-button-text p-button-sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        />
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          icon="pi pi-plus"
                          className="p-button-rounded p-button-text p-button-sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        />
                      </div>
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-text p-button-danger p-button-sm"
                        onClick={() => removeFromCart(item.product.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-auto pt-4 border-t">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <motion.span
                    className="font-bold text-lg"
                    style={{ color: theme.colors.primary }}
                    key={cartTotal} // This forces animation to run on value change
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(cartTotal)}
                  </motion.span>
                </div>
                <Button
                  label="Checkout"
                  icon="pi pi-check"
                  className="w-full"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  }}
                  onClick={handleCheckout}
                />
                <Button
                  label="Continue Shopping"
                  icon="pi pi-arrow-left"
                  className="w-full mt-2 p-button-outlined"
                  onClick={() => setShowCart(false)}
                />
              </div>
            </>
          )}
        </div>
      </Sidebar>
    );
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-teal-500 border-teal-200 rounded-full"
            />
          </div>
          <ProgressSpinner
            style={{ width: "100px", height: "100px" }}
            strokeWidth="4"
            fill="transparent"
            animationDuration="1s"
          />
        </div>
        <p className="mt-6 text-lg font-medium text-gray-600">
          Loading products...
        </p>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen p-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center"
            >
              <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <Button
            label="Try Again"
            icon="pi pi-refresh"
            className="w-full"
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      {renderCartSidebar()}

      {/* Header with back button and cart */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-md py-5 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/">
            <motion.div
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <i className="pi pi-arrow-left mr-2"></i>
              <span>Back to Home</span>
            </motion.div>
          </Link>
          <h1
            className="text-3xl font-bold md:block"
            style={{ color: theme.colors.accent }}
          >
            Engel Shop
          </h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              icon="pi pi-shopping-cart"
              className="p-button-rounded p-button-lg relative"
              style={{
                backgroundColor: theme.colors.accent,
                borderColor: theme.colors.accent,
              }}
              onClick={() => setShowCart(true)}
              disabled={cartItemCount === 0}
            />
            {cartItemCount > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                {cartItemCount}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white shadow-sm py-4 mb-6"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-full"
                />
              </span>
            </div>
            <div className="flex-grow overflow-x-auto pb-2 md:pb-0">
              <div className="flex gap-2 min-w-max">
                {CATEGORIES.map((category) => (
                  <motion.div
                    key={category.value}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      label={category.label}
                      className={`p-button-sm rounded-full ${
                        selectedCategory === category.value
                          ? "p-button-raised"
                          : "p-button-outlined"
                      }`}
                      style={
                        selectedCategory === category.value
                          ? {
                              backgroundColor: theme.colors.accent,
                              borderColor: theme.colors.accent,
                            }
                          : {}
                      }
                      onClick={() => setSelectedCategory(category.value)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 pb-16">
        <motion.h1
          className="text-3xl font-bold mb-6"
          style={{ color: theme.colors.primary }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {selectedCategory === "all"
            ? "All Products"
            : CATEGORIES.find((c) => c.value === selectedCategory)?.label ||
              "Products"}
        </motion.h1>

        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <i className="pi pi-search text-6xl text-gray-300 mb-6"></i>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                No Products Found
              </h2>
              <p className="text-gray-500 mb-8">
                We couldn't find any products matching your criteria
              </p>
              <Button
                label="Clear Filters"
                icon="pi pi-filter-slash"
                className="p-button-outlined"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative overflow-hidden group">
                  <img
                    src={product.imageUrl || "/placeholder-image.jpg"}
                    alt={product.name}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === "In Stock"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status}
                  </div>
                  {product.status === "In Stock" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        label="Quick Add"
                        icon="pi pi-shopping-cart"
                        className="w-full"
                        style={{
                          backgroundColor: theme.colors.accent,
                          borderColor: theme.colors.accent,
                        }}
                        onClick={() => addToCart(product)}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold truncate flex-1">
                      {product.name}
                    </h3>
                    <p
                      className="font-bold text-lg ml-2"
                      style={{ color: theme.colors.primary }}
                    >
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(product.price)}
                    </p>
                  </div>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {product.excerpt || "No description available"}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      label="View Details"
                      icon="pi pi-eye"
                      className="p-button-outlined flex-1"
                      onClick={() => viewProductDetails(product)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        mode="view"
        product={selectedProduct}
        onClose={closeProductModal}
        userType="customer"
        onAddToCart={addToCart}
      />
    </div>
  );
}
