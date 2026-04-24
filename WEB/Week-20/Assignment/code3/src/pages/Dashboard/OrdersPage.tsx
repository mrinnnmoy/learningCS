import { useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { searchAtom, statusFilterAtom } from "../../store/atoms";
import { filteredOrdersSelector } from "../../store/selectors";
import useDebounce from "../../hooks/useDebounce";
import { Order, OrderStatus } from "../../types";

type FilterValue = OrderStatus | "all";
const STATUSES: FilterValue[] = [
  "all",
  "pending",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<OrderStatus, [string, string]> = {
  delivered: ["#d1fae5", "#065f46"],
  pending: ["#fef3c7", "#92400e"],
  shipped: ["#dbeafe", "#1e40af"],
  cancelled: ["#fee2e2", "#991b1b"],
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const [bg, color] = STATUS_COLORS[status];
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "0.15rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rawSearch, setRawSearch] = useRecoilState<string>(searchAtom);
  const setStatusFilter = useSetRecoilState<FilterValue>(statusFilterAtom);
  const filteredOrders = useRecoilValue<Order[]>(filteredOrdersSelector);

  const statusParam = (searchParams.get("status") ?? "all") as FilterValue;

  // Sync URL param → Recoil atom so the selector reflects the URL on page load/refresh
  useEffect(() => {
    setStatusFilter(statusParam);
  }, [statusParam, setStatusFilter]);

  const debouncedSearch = useDebounce<string>(rawSearch, 300);

  // useMemo<Order[]> — sort only recomputes when filteredOrders actually changes
  const sorted = useMemo<Order[]>(
    () =>
      [...filteredOrders].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [filteredOrders],
  );

  const setStatus = useCallback(
    (s: FilterValue): void => {
      setSearchParams({ status: s });
    },
    [setSearchParams],
  );

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Orders</h2>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              background: statusParam === s ? "#3b82f6" : "white",
              color: statusParam === s ? "white" : "#374151",
              fontSize: "0.8125rem",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <input
        placeholder="Search by customer or order ID..."
        value={rawSearch}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRawSearch(e.target.value)
        }
        style={{
          padding: "0.6rem 0.8rem",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "360px",
          marginBottom: "1.5rem",
          fontSize: "0.875rem",
        }}
      />

      <p
        style={{
          color: "#64748b",
          fontSize: "0.875rem",
          marginBottom: "0.5rem",
        }}
      >
        {sorted.length} orders
      </p>

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
              {["Order", "Customer", "Amount", "Status", "Date"].map((h) => (
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
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              sorted.map((o: Order) => (
                <tr key={o.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    {o.id}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>{o.customer}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    ${o.total.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#64748b" }}>
                    {o.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
