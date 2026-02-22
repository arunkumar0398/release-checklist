import { ReleaseStatus } from "../types";

const CONFIG: Record<ReleaseStatus, { label: string; color: string; bg: string }> = {
  planned: { label: "Planned", color: "#6b7280", bg: "#f3f4f6" },
  ongoing: { label: "Ongoing", color: "#d97706", bg: "#fef3c7" },
  done: { label: "Done", color: "#059669", bg: "#d1fae5" },
};

export function StatusBadge({ status }: { status: ReleaseStatus }) {
  const { label, color, bg } = CONFIG[status];
  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
}
