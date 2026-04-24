import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, updateDisplayName } = useAuth();
  const [name, setName] = useState<string>(user?.name ?? "");
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!name.trim()) return;
    updateDisplayName(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Settings</h2>
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid #e2e8f0",
          maxWidth: "400px",
        }}
      >
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginTop: 0 }}>
          Logged in as {user?.email}
        </p>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "0.3rem",
              }}
            >
              Display name
            </label>
            <input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                setSaved(false);
              }}
              style={{
                padding: "0.6rem 0.8rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                width: "100%",
                fontSize: "0.95rem",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              type="submit"
              style={{
                background: "#3b82f6",
                color: "white",
                border: "none",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Save changes
            </button>
            {saved && (
              <span
                style={{
                  color: "#22c55e",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                ✓ Saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
