import { useRecoilValue } from "recoil";
import { productsAtom } from "../../store/atoms";
import { Product } from "../../types";

export default function ProductsPage() {
  const products = useRecoilValue<Product[]>(productsAtom);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Products</h2>
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead style={{ background: "#f8fafc" }}>
            <tr style={{ color: "#64748b", textAlign: "left" }}>
              {["Name", "Category", "Price", "Stock"].map((h) => (
                <th
                  key={h}
                  style={{ padding: "0.75rem 1rem", fontWeight: 500 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p: Product) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                  {p.name}
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>
                  {p.category}
                </td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                  ${p.price.toFixed(2)}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span
                    style={{
                      fontWeight: 600,
                      color: p.stock < 10 ? "#ef4444" : "#0f172a",
                    }}
                  >
                    {p.stock}
                  </span>
                  {p.stock < 10 && (
                    <span
                      style={{
                        marginLeft: "0.4rem",
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      LOW
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
