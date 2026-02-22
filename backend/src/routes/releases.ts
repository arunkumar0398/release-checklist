import { Router, Request, Response } from "express";
import prisma from "../db";
import { RELEASE_STEPS } from "../steps";

const router = Router();

function computeStatus(
  completedCount: number,
  totalSteps: number
): "planned" | "ongoing" | "done" {
  if (completedCount === 0) return "planned";
  if (completedCount === totalSteps) return "done";
  return "ongoing";
}

function buildReleaseResponse(
  release: {
    id: string;
    name: string;
    date: Date;
    additionalInfo: string | null;
    createdAt: Date;
    updatedAt: Date;
    steps: { stepIndex: number; completed: boolean }[];
  }
) {
  const stepsMap = new Map(release.steps.map((s) => [s.stepIndex, s.completed]));
  const steps = RELEASE_STEPS.map((label, index) => ({
    index,
    label,
    completed: stepsMap.get(index) ?? false,
  }));
  const completedCount = steps.filter((s) => s.completed).length;
  return {
    id: release.id,
    name: release.name,
    date: release.date,
    additionalInfo: release.additionalInfo,
    createdAt: release.createdAt,
    updatedAt: release.updatedAt,
    status: computeStatus(completedCount, RELEASE_STEPS.length),
    steps,
  };
}

// GET /api/releases
router.get("/", async (_req: Request, res: Response) => {
  try {
    const releases = await prisma.release.findMany({
      include: { steps: true },
      orderBy: { date: "asc" },
    });
    res.json(releases.map(buildReleaseResponse));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch releases" });
  }
});

// GET /api/releases/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const release = await prisma.release.findUnique({
      where: { id: req.params.id },
      include: { steps: true },
    });
    if (!release) return res.status(404).json({ error: "Release not found" });
    res.json(buildReleaseResponse(release));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch release" });
  }
});

// POST /api/releases
router.post("/", async (req: Request, res: Response) => {
  const { name, date, additionalInfo } = req.body;
  if (!name || !date) {
    return res.status(400).json({ error: "name and date are required" });
  }
  try {
    const release = await prisma.release.create({
      data: {
        name,
        date: new Date(date),
        additionalInfo: additionalInfo ?? null,
        steps: {
          create: RELEASE_STEPS.map((_, index) => ({
            stepIndex: index,
            completed: false,
          })),
        },
      },
      include: { steps: true },
    });
    res.status(201).json(buildReleaseResponse(release));
  } catch (err) {
    res.status(500).json({ error: "Failed to create release" });
  }
});

// PATCH /api/releases/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const { additionalInfo } = req.body;
  try {
    const release = await prisma.release.update({
      where: { id: req.params.id },
      data: { additionalInfo },
      include: { steps: true },
    });
    res.json(buildReleaseResponse(release));
  } catch (err) {
    res.status(500).json({ error: "Failed to update release" });
  }
});

// PATCH /api/releases/:id/steps/:stepIndex
router.patch("/:id/steps/:stepIndex", async (req: Request, res: Response) => {
  const stepIndex = parseInt(req.params.stepIndex, 10);
  const { completed } = req.body;

  if (stepIndex < 0 || stepIndex >= RELEASE_STEPS.length) {
    return res.status(400).json({ error: "Invalid step index" });
  }
  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be a boolean" });
  }

  try {
    await prisma.releaseStep.upsert({
      where: {
        releaseId_stepIndex: { releaseId: req.params.id, stepIndex },
      },
      update: { completed },
      create: { releaseId: req.params.id, stepIndex, completed },
    });
    const release = await prisma.release.findUnique({
      where: { id: req.params.id },
      include: { steps: true },
    });
    if (!release) return res.status(404).json({ error: "Release not found" });
    res.json(buildReleaseResponse(release));
  } catch (err) {
    res.status(500).json({ error: "Failed to update step" });
  }
});

// DELETE /api/releases/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.release.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete release" });
  }
});

export default router;
