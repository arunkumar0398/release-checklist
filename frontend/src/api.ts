import { Release } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";
const BASE = `${BACKEND_URL}/api/releases`;

export async function fetchReleases(): Promise<Release[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch releases");
  return res.json();
}

export async function fetchRelease(id: string): Promise<Release> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch release");
  return res.json();
}

export async function createRelease(data: {
  name: string;
  date: string;
  additionalInfo?: string;
}): Promise<Release> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create release");
  return res.json();
}

export async function updateRelease(
  id: string,
  data: { additionalInfo: string | null }
): Promise<Release> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update release");
  return res.json();
}

export async function toggleStep(
  id: string,
  stepIndex: number,
  completed: boolean
): Promise<Release> {
  const res = await fetch(`${BASE}/${id}/steps/${stepIndex}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update step");
  return res.json();
}

export async function deleteRelease(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete release");
}
