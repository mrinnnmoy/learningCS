import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const linkStyle = ({ isActive }: { isActive: boolean }): string =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem",
        background: "#1e293b",
        color: "white",
        alignItems: "center",
      }}
    >
      <NavLink to="/" className={linkStyle} style={{ color: "inherit" }}>
        Home
      </NavLink>
      <NavLink
        to="/dashboard"
        className={linkStyle}
        style={{ color: "inherit" }}
      >
        Dashboard
      </NavLink>
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        {user ? (
          <>
            <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              {user.email}
            </span>
            <button
              onClick={logout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "0.3rem 0.75rem",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: "#60a5fa" }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
