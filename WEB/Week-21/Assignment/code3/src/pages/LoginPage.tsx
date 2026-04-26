import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputStyle: React.CSSProperties = {
  padding: "0.6rem 0.8rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!email || !password) {
      setError("Both fields are required");
      return;
    }
    login(email);
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "4rem 1rem",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Sign in</h1>

        {error && (
          <p role="alert" style={{ color: "red", margin: "0 0 1rem" }}>
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <label
            htmlFor="email"
            style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
          >
            Email
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label
            htmlFor="password"
            style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
          >
            Password
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              padding: "0.65rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
