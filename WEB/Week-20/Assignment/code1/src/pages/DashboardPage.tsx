import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>
        Welcome back, <strong>{user?.name}</strong>!
      </p>
      <p>
        This page is only visible to authenticated users. Visiting{" "}
        <code>/dashboard</code> while logged out redirects to{" "}
        <code>/login</code>.
      </p>
    </div>
  );
}
