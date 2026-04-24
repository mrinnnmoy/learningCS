import { useRecoilState, useRecoilValue } from "recoil";
import { cartAtom } from "../store/atoms";
import { cartTotalSelector } from "../store/selectors";
import { CartItem } from "../types";

const qtyBtn: React.CSSProperties = {
  width: "28px",
  height: "28px",
  border: "1px solid #e2e8f0",
  background: "white",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "1rem",
};

export default function CartPage() {
  const [cart, setCart] = useRecoilState<CartItem[]>(cartAtom);
  const total = useRecoilValue<number>(cartTotalSelector);

  const updateQty = (id: number, delta: number): void => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const remove = (id: number): void =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = (): void => setCart([]);

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Your Cart</h1>
      {cart.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem" }}>
            {cart.map((item: CartItem) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>
                    {item.title}
                  </p>
                  <p
                    style={{
                      margin: "0.2rem 0 0",
                      color: "#3b82f6",
                      fontWeight: 700,
                    }}
                  >
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <button onClick={() => updateQty(item.id, -1)} style={qtyBtn}>
                    −
                  </button>
                  <span style={{ minWidth: "1.5rem", textAlign: "center" }}>
                    {item.qty}
                  </span>
                  <button onClick={() => updateQty(item.id, +1)} style={qtyBtn}>
                    +
                  </button>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 0",
              borderTop: "2px solid #1e293b",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Total: ${total.toFixed(2)}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={clearCart}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Clear cart
              </button>
              <button
                style={{
                  background: "#22c55e",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
