import { NavLink } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { cartCountSelector } from "../store/selectors";

export default function Navbar() {
  const cartCount = useRecoilValue<number>(cartCountSelector);
  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1rem 1.5rem",
        background: "#1e293b",
        color: "white",
        alignItems: "center",
      }}
    >
      <NavLink
        to="/"
        style={({ isActive }) => ({
          color: isActive ? "#60a5fa" : "white",
          fontWeight: 600,
        })}
      >
        Store
      </NavLink>
      <NavLink
        to="/cart"
        style={({ isActive }) => ({
          color: isActive ? "#60a5fa" : "white",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        })}
      >
        Cart
        {cartCount > 0 && (
          <span
            style={{
              background: "#ef4444",
              color: "white",
              borderRadius: "999px",
              fontSize: "0.7rem",
              padding: "0.1rem 0.4rem",
              fontWeight: 700,
            }}
          >
            {cartCount}
          </span>
        )}
      </NavLink>
    </nav>
  );
}
