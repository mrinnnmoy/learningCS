import { NavLink, Outlet } from "react-router-dom";
import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useClickOutside from "../hooks/useClickOutside";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "📊 Overview", end: true },
  { to: "/dashboard/orders", label: "🛒 Orders" },
  { to: "/dashboard/products", label: "📦 Products" },
  { to: "/dashboard/settings", label: "⚙️ Settings" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const closeDropdown = useCallback((): void => setDropdownOpen(false), []);
  const dropdownRef = useClickOutside<HTMLDivElement>(closeDropdown);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <aside
        style={{
          width: "220px",
          background: "#0f172a",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          padding: "1rem 0.75rem",
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "1.2rem",
            padding: "0.5rem 0.5rem 1.5rem",
          }}
        >
          Brandly
        </div>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            flex: 1,
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "block",
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                textDecoration: "none",
                background: isActive ? "#3b82f6" : "transparent",
                color: isActive ? "white" : "#94a3b8",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            height: "60px",
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 1.5rem",
          }}
        >
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                background: "none",
                border: "1px solid #e2e8f0",
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              👤 {user?.name}
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  minWidth: "160px",
                  overflow: "hidden",
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8125rem",
                    color: "#64748b",
                  }}
                >
                  {user?.email}
                </div>
                <hr style={{ margin: 0, borderColor: "#f1f5f9" }} />
                <button
                  onClick={logout}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.6rem 1rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#ef4444",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: "#f8fafc",
            padding: "2rem",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
