import { useRecoilValue } from "recoil";
import { ordersAtom } from "../../store/atoms";
import { orderStatsSelector } from "../../store/selectors";
import { Order, OrderStatus, OrderStats } from "../../types";

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

export default function OverviewPage() {
  const stats: OrderStats = useRecoilValue(orderStatsSelector);
  const allOrders: Order[] = useRecoilValue(ordersAtom);
  const recentOrders: Order[] = [...allOrders].reverse().slice(0, 5);

  const statCard = (label: string, value: string | number, color?: string) => (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.8125rem",
          color: "#64748b",
          fontWeight: 500,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "0.5rem 0 0",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: color ?? "#0f172a",
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Overview</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {statCard("Total Revenue", `$${stats.totalRevenue.toFixed(2)}`)}
        {statCard("Total Orders", stats.orderCount)}
        {statCard("Pending", stats.pendingCount, "#f59e0b")}
        {statCard("Delivered", stats.deliveredCount, "#22c55e")}
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Recent Orders</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ color: "#64748b", textAlign: "left" }}>
              {["Order", "Customer", "Amount", "Status"].map((h) => (
                <th
                  key={h}
                  style={{ paddingBottom: "0.5rem", fontWeight: 500 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o: Order) => (
              <tr key={o.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.6rem 0", fontWeight: 600 }}>{o.id}</td>
                <td style={{ padding: "0.6rem 0" }}>{o.customer}</td>
                <td style={{ padding: "0.6rem 0", fontWeight: 600 }}>
                  ${o.total.toFixed(2)}
                </td>
                <td style={{ padding: "0.6rem 0" }}>
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
