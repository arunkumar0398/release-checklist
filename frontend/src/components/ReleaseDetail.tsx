import { useState, useEffect } from "react";
import { Release } from "../types";
import { StatusBadge } from "./StatusBadge";
import { toggleStep, updateRelease, deleteRelease } from "../api";

interface Props {
  release: Release;
  onUpdated: (r: Release) => void;
  onDeleted: (id: string) => void;
}

export function ReleaseDetail({ release, onUpdated, onDeleted }: Props) {
  const [additionalInfo, setAdditionalInfo] = useState(release.additionalInfo ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingStep, setTogglingStep] = useState<number | null>(null);

  useEffect(() => {
    setAdditionalInfo(release.additionalInfo ?? "");
    setEditing(false);
  }, [release.id, release.additionalInfo]);

  async function handleToggleStep(stepIndex: number, completed: boolean) {
    setTogglingStep(stepIndex);
    try {
      const updated = await toggleStep(release.id, stepIndex, completed);
      onUpdated(updated);
    } finally {
      setTogglingStep(null);
    }
  }

  async function handleSaveInfo() {
    setSaving(true);
    try {
      const updated = await updateRelease(release.id, { additionalInfo: additionalInfo || null });
      onUpdated(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete release "${release.name}"? This cannot be undone.`)) return;
    await deleteRelease(release.id);
    onDeleted(release.id);
  }

  const completedCount = release.steps.filter((s) => s.completed).length;
  const totalSteps = release.steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  return (
    <div style={container}>
      {/* Header */}
      <div style={topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{release.name}</h2>
          <StatusBadge status={release.status} />
        </div>
        <button onClick={handleDelete} style={deleteBtn} title="Delete release">Delete</button>
      </div>

      {/* Meta */}
      <div style={metaRow}>
        <div style={metaItem}>
          <span style={metaLabel}>Release date</span>
          <span style={metaValue}>{new Date(release.date).toLocaleString()}</span>
        </div>
        <div style={metaItem}>
          <span style={metaLabel}>Progress</span>
          <span style={metaValue}>{completedCount} / {totalSteps} steps</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, borderRadius: 6, background: "#e5e7eb", overflow: "hidden", margin: "4px 0 24px" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 6,
            width: `${progress}%`,
            background: release.status === "done" ? "#059669" : release.status === "ongoing" ? "#d97706" : "#d1d5db",
            transition: "width 0.4s",
          }}
        />
      </div>

      {/* Steps */}
      <section style={section}>
        <h3 style={sectionTitle}>Checklist</h3>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {release.steps.map((step) => {
            const isLoading = togglingStep === step.index;
            return (
              <li
                key={step.index}
                style={{
                  ...stepItem,
                  background: step.completed ? "#f0fdf4" : "#fafafa",
                  border: `1px solid ${step.completed ? "#bbf7d0" : "#e5e7eb"}`,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", width: "100%" }}>
                  <input
                    type="checkbox"
                    checked={step.completed}
                    disabled={isLoading}
                    onChange={(e) => handleToggleStep(step.index, e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#4f46e5", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: 14,
                      color: step.completed ? "#374151" : "#374151",
                      textDecoration: step.completed ? "line-through" : "none",
                    }}
                  >
                    {step.label}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Additional Info */}
      <section style={{ ...section, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={sectionTitle}>Additional Info</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} style={editBtn}>Edit</button>
          )}
        </div>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
              style={textarea}
              placeholder="Add notes about this release..."
              autoFocus
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSaveInfo} disabled={saving} style={saveBtn}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => { setEditing(false); setAdditionalInfo(release.additionalInfo ?? ""); }} style={cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: additionalInfo ? "#374151" : "#9ca3af", lineHeight: 1.6 }}>
            {additionalInfo || "No additional info."}
          </p>
        )}
      </section>
    </div>
  );
}

const container: React.CSSProperties = {
  flex: 1,
  padding: "32px 40px",
  overflow: "auto",
  maxWidth: 760,
};
const topBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 12,
};
const metaRow: React.CSSProperties = {
  display: "flex",
  gap: 32,
  marginBottom: 12,
  flexWrap: "wrap",
};
const metaItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};
const metaLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: "#6b7280",
};
const metaValue: React.CSSProperties = {
  fontSize: 14,
  color: "#111827",
  fontWeight: 500,
};
const section: React.CSSProperties = {};
const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 10,
};
const stepItem: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  transition: "all 0.2s",
};
const editBtn: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#4f46e5",
  background: "none",
  border: "1px solid #4f46e5",
  borderRadius: 6,
  padding: "3px 10px",
  cursor: "pointer",
};
const textarea: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  resize: "vertical",
  outline: "none",
};
const saveBtn: React.CSSProperties = {
  padding: "7px 16px",
  background: "#4f46e5",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
const cancelBtn: React.CSSProperties = {
  padding: "7px 14px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
};
const deleteBtn: React.CSSProperties = {
  padding: "6px 14px",
  background: "#fff",
  color: "#dc2626",
  border: "1px solid #fca5a5",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
