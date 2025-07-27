export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  status: "In Stock" | "Out of Stock";
  excerpt: string;
  isVisible: boolean;
  category?: string;
}
