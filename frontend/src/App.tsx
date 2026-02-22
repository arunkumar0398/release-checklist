import { useEffect, useState, useCallback } from "react";
import { Release } from "./types";
import { fetchReleases, createRelease } from "./api";
import { ReleaseList } from "./components/ReleaseList";
import { ReleaseDetail } from "./components/ReleaseDetail";
import { CreateReleaseModal } from "./components/CreateReleaseModal";

export default function App() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReleases = useCallback(async () => {
    try {
      const data = await fetchReleases();
      setReleases(data);
      setSelectedId((prev) => (data.find((r) => r.id === prev) ? prev : data[0]?.id ?? null));
    } catch {
      setError("Could not load releases. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReleases(); }, [loadReleases]);

  async function handleCreate(data: { name: string; date: string; additionalInfo?: string }) {
    const created = await createRelease(data);
    setReleases((prev) => [...prev, created]);
    setSelectedId(created.id);
    setShowModal(false);
  }

  function handleUpdated(updated: Release) {
    setReleases((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function handleDeleted(id: string) {
    setReleases((prev) => {
      const next = prev.filter((r) => r.id !== id);
      setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }

  const selectedRelease = releases.find((r) => r.id === selectedId) ?? null;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#6b7280" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 12 }}>
        <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>
        <button onClick={loadReleases} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <ReleaseList
        releases={releases}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNew={() => setShowModal(true)}
      />

      <main style={{ flex: 1, overflow: "auto" }}>
        {selectedRelease ? (
          <ReleaseDetail
            key={selectedRelease.id}
            release={selectedRelease}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 15 }}>Select a release or create a new one.</p>
            <button onClick={() => setShowModal(true)} style={{ padding: "9px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              + New Release
            </button>
          </div>
        )}
      </main>

      {showModal && (
        <CreateReleaseModal onClose={() => setShowModal(false)} onCreated={handleCreate} />
      )}
    </div>
  );
}
