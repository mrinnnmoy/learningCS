import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../types";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json() as Promise<Product[]>;
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p aria-label="loading">Loading products...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <section aria-label="product list">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={() => {}} />
      ))}
    </section>
  );
}
