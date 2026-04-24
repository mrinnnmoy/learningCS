import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { Product } from "../types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: product,
    loading,
    error,
  } = useFetch<Product>(id ? `https://dummyjson.com/products/${id}` : null);

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (error)
    return <p style={{ padding: "2rem", color: "red" }}>Error: {error}</p>;
  if (!product) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <Link to="/" style={{ color: "#3b82f6" }}>
        ← Back to products
      </Link>
      <img
        src={product.thumbnail}
        alt={product.title}
        style={{ width: "100%", borderRadius: "8px", marginTop: "1rem" }}
      />
      <h1>{product.title}</h1>
      <p style={{ color: "#64748b" }}>{product.description}</p>
      <p>
        <strong>Price:</strong> ${product.price}
      </p>
      <p>
        <strong>Rating:</strong> ⭐ {product.rating}
      </p>
      <p>
        <strong>Category:</strong> {product.category}
      </p>
    </div>
  );
}
