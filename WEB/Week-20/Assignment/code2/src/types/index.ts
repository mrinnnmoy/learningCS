export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  thumbnail: string;
  category: string;
  rating: number;
  stock: number;
}

export interface CartItem extends Omit<
  Product,
  "description" | "rating" | "stock"
> {
  qty: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}
