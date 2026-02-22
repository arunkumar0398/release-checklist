import request from "supertest";
import app from "../index";
import prisma from "../db";

beforeEach(async () => {
  await prisma.releaseStep.deleteMany();
  await prisma.release.deleteMany();
});

afterAll(async () => {
  await prisma.releaseStep.deleteMany();
  await prisma.release.deleteMany();
  await prisma.$disconnect();
});

describe("Releases API", () => {
  it("GET /api/releases returns empty array initially", async () => {
    const res = await request(app).get("/api/releases");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/releases creates a release with planned status", async () => {
    const res = await request(app).post("/api/releases").send({
      name: "v1.0.0",
      date: "2024-07-01T10:00:00.000Z",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("v1.0.0");
    expect(res.body.status).toBe("planned");
    expect(res.body.steps).toHaveLength(10);
  });

  it("PATCH /api/releases/:id/steps/:stepIndex updates step and changes status to ongoing", async () => {
    const createRes = await request(app).post("/api/releases").send({
      name: "v1.1.0",
      date: "2024-08-01T10:00:00.000Z",
    });
    const releaseId = createRes.body.id;

    const patchRes = await request(app)
      .patch(`/api/releases/${releaseId}/steps/0`)
      .send({ completed: true });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe("ongoing");
    expect(patchRes.body.steps[0].completed).toBe(true);
  });

  it("status becomes done when all steps completed", async () => {
    const createRes = await request(app).post("/api/releases").send({
      name: "v2.0.0",
      date: "2024-09-01T10:00:00.000Z",
    });
    const releaseId = createRes.body.id;
    const stepCount = createRes.body.steps.length;

    for (let i = 0; i < stepCount; i++) {
      await request(app)
        .patch(`/api/releases/${releaseId}/steps/${i}`)
        .send({ completed: true });
    }

    const res = await request(app).get(`/api/releases/${releaseId}`);
    expect(res.body.status).toBe("done");
  });

  it("DELETE /api/releases/:id removes a release", async () => {
    const createRes = await request(app).post("/api/releases").send({
      name: "v3.0.0",
      date: "2024-10-01T10:00:00.000Z",
    });
    const releaseId = createRes.body.id;

    const delRes = await request(app).delete(`/api/releases/${releaseId}`);
    expect(delRes.status).toBe(204);

    const getRes = await request(app).get(`/api/releases/${releaseId}`);
    expect(getRes.status).toBe(404);
  });
});
