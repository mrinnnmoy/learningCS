import { memo, useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { cartAtom } from "../store/atoms";
import { Product, CartItem } from "../types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const setCart = useSetRecoilState<CartItem[]>(cartAtom);

  const addToCart = useCallback((): void => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      const { description: _d, rating: _r, stock: _s, ...rest } = product;
      return [...prev, { ...rest, qty: 1 }];
    });
  }, [product, setCart]);

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        background: "white",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <img
        src={product.thumbnail}
        alt={product.title}
        style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
      />
      <div
        style={{
          padding: "0.75rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        <p
          style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", flex: 1 }}
        >
          {product.title}
        </p>
        <p style={{ margin: 0, color: "#3b82f6", fontWeight: 700 }}>
          ${product.price}
        </p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
          ⭐ {product.rating} · {product.category}
        </p>
        <button
          onClick={addToCart}
          style={{
            marginTop: "0.5rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            padding: "0.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
