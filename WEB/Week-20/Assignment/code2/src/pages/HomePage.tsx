import { useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { searchAtom } from "../store/atoms";
import useFetch from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import { Product, ProductListResponse } from "../types";

const PAGE_SIZE = 10;

const filterBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.3rem 0.8rem",
  borderRadius: "999px",
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  background: active ? "#3b82f6" : "white",
  color: active ? "white" : "#374151",
  fontSize: "0.8125rem",
});

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useRecoilState<string>(searchAtom);

  const category = searchParams.get("category") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const { data, loading, error } = useFetch<ProductListResponse>(
    "https://dummyjson.com/products?limit=100",
  );
  const products = data?.products ?? [];

  const categories = [
    ...new Set(products.map((p: Product) => p.category)),
  ].sort();

  const filtered = products.filter((p: Product) => {
    const matchCat = !category || p.category === category;
    const matchSearch =
      !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setCategory = (cat: string): void =>
    setSearchParams({ category: cat, page: "1" });
  const setPage = (p: number): void =>
    setSearchParams({ category, page: String(p) });

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (error)
    return <p style={{ padding: "2rem", color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Products</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value);
          setSearchParams({ category, page: "1" });
        }}
        style={{
          padding: "0.6rem 0.8rem",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "1rem",
          fontSize: "0.95rem",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={() => setCategory("")}
          style={filterBtnStyle(!category)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={filterBtnStyle(category === cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <p
        style={{ color: "#64748b", marginBottom: "1rem", fontSize: "0.875rem" }}
      >
        {filtered.length} products
      </p>

      {paginated.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            gap: "1rem",
          }}
        >
          {paginated.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "2rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              padding: "0.3rem 0.7rem",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              background: "white",
            }}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                padding: "0.3rem 0.7rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                background: p === page ? "#3b82f6" : "white",
                color: p === page ? "white" : "#374151",
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            style={{
              padding: "0.3rem 0.7rem",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              background: "white",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
