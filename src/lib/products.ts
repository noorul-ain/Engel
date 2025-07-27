import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  Query,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Product } from "../types/product";

// Collection reference
const productsCollection = collection(db, "products");

// Helper to convert Firestore document to Product type
const convertDocToProduct = (
  doc: QueryDocumentSnapshot<DocumentData>
): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    price: data.price,
    imageUrl: data.imageUrl,
    status: data.status,
    excerpt: data.excerpt,
    isVisible: data.isVisible,
  };
};

/**
 * Get all products from Firestore
 * @param onlyVisible If true, returns only products with isVisible=true
 * @returns Array of Product objects
 */
export const getAllProducts = async (
  onlyVisible = false
): Promise<Product[]> => {
  try {
    let productsQuery: CollectionReference<DocumentData> | Query<DocumentData> =
      productsCollection;

    if (onlyVisible) {
      productsQuery = query(productsCollection, where("isVisible", "==", true));
    }

    const querySnapshot = await getDocs(productsQuery);
    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error("Error getting products:", error);
    throw new Error("Failed to fetch products");
  }
};

/**
 * Get a single product by ID
 * @param id Product ID
 * @returns Product object or null if not found
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return null;
    }

    return {
      id: productSnap.id,
      ...productSnap.data(),
    } as Product;
  } catch (error) {
    console.error(`Error getting product with ID ${id}:`, error);
    throw new Error(`Failed to fetch product with ID ${id}`);
  }
};

/**
 * Add a new product to Firestore
 * @param product Product data (without ID)
 * @returns The ID of the newly created product
 */
export const addProduct = async (
  product: Omit<Product, "id">
): Promise<string> => {
  try {
    const docRef = await addDoc(productsCollection, product);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Failed to add product");
  }
};

/**
 * Update an existing product
 * @param id Product ID
 * @param data Updated product data (partial)
 */
export const updateProduct = async (
  id: string,
  data: Partial<Omit<Product, "id">>
): Promise<void> => {
  try {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, data);
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw new Error(`Failed to update product with ID ${id}`);
  }
};

/**
 * Delete a product by ID
 * @param id Product ID
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw new Error(`Failed to delete product with ID ${id}`);
  }
};
