import { useState } from "react";

interface Props {
  onClose: () => void;
  onCreated: (data: { name: string; date: string; additionalInfo?: string }) => void;
}

export function CreateReleaseModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    if (!date) { setError("Date is required"); return; }
    onCreated({ name: name.trim(), date, additionalInfo: additionalInfo.trim() || undefined });
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>New Release</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}

          <label style={labelStyle}>
            Name <span style={{ color: "#dc2626" }}>*</span>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. v2.5.0"
              autoFocus
            />
          </label>

          <label style={labelStyle}>
            Release Date <span style={{ color: "#dc2626" }}>*</span>
            <input
              type="datetime-local"
              style={inputStyle}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label style={labelStyle}>
            Additional Info
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Optional notes about this release..."
            />
          </label>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" style={submitBtn}>Create Release</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 28, width: "100%",
  maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
};
const labelStyle: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 5,
  fontSize: 13, fontWeight: 600, color: "#374151",
};
const inputStyle: React.CSSProperties = {
  padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8,
  fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%",
};
const closeBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: 18, color: "#6b7280", lineHeight: 1,
};
const cancelBtn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db",
  background: "#fff", cursor: "pointer", fontSize: 14,
};
const submitBtn: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 8, border: "none",
  background: "#4f46e5", color: "#fff", cursor: "pointer",
  fontSize: 14, fontWeight: 600,
};
