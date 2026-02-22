import { Release } from "../types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  releases: Release[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function ReleaseList({ releases, selectedId, onSelect, onNew }: Props) {
  return (
    <aside style={sidebar}>
      <div style={header}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>Releases</h1>
        <button onClick={onNew} style={newBtn}>+ New</button>
      </div>

      {releases.length === 0 && (
        <p style={{ padding: "24px 16px", color: "#9ca3af", fontSize: 13, textAlign: "center" }}>
          No releases yet. Create your first one.
        </p>
      )}

      <ul style={{ listStyle: "none" }}>
        {releases.map((r) => {
          const completed = r.steps.filter((s) => s.completed).length;
          const total = r.steps.length;
          const isSelected = r.id === selectedId;
          return (
            <li
              key={r.id}
              onClick={() => onSelect(r.id)}
              style={{
                ...listItem,
                background: isSelected ? "#eef2ff" : "transparent",
                borderLeft: isSelected ? "3px solid #4f46e5" : "3px solid transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#111827", flex: 1 }}>{r.name}</span>
                <StatusBadge status={r.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                <span>{new Date(r.date).toLocaleDateString()}</span>
                <span>{completed}/{total} steps</span>
              </div>
              <div style={{ marginTop: 6, height: 4, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 4,
                    width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                    background: r.status === "done" ? "#059669" : r.status === "ongoing" ? "#d97706" : "#d1d5db",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

const sidebar: React.CSSProperties = {
  width: 280,
  minWidth: 240,
  background: "#fff",
  borderRight: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "sticky",
  top: 0,
  overflow: "auto",
};
const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 16px 12px",
  borderBottom: "1px solid #e5e7eb",
  position: "sticky",
  top: 0,
  background: "#fff",
  zIndex: 1,
};
const newBtn: React.CSSProperties = {
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "5px 12px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
const listItem: React.CSSProperties = {
  padding: "12px 16px",
  cursor: "pointer",
  transition: "background 0.15s",
};
