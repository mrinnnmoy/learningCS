import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { Product, ProductListResponse } from "../types";

export default function HomePage() {
  const { data, loading, error } = useFetch<ProductListResponse>(
    "https://dummyjson.com/products?limit=12",
  );

  if (loading) return <p style={{ padding: "2rem" }}>Loading products...</p>;
  if (error)
    return <p style={{ padding: "2rem", color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Products</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {data?.products.map((p: Product) => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "1rem",
                background: "white",
              }}
            >
              <img
                src={p.thumbnail}
                alt={p.title}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
              <h3 style={{ margin: "0.5rem 0 0.25rem", fontSize: "0.9rem" }}>
                {p.title}
              </h3>
              <p style={{ margin: 0, color: "#3b82f6", fontWeight: "bold" }}>
                ${p.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
