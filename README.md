# Release Checklist

A single-page application to manage software releases with a step-by-step checklist.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Vite          |
| Backend  | Node.js, Express, TypeScript        |
| ORM      | Prisma                              |
| Database | PostgreSQL                          |
| Infra    | Docker, docker-compose, Nginx       |

---

## Running Locally

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:3001

### Option B — Manual

**Prerequisites:** Node 20+, a running PostgreSQL instance.

**Backend**

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL
npm install
npx prisma db push            # create tables
npm run dev                   # starts on :3001
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                   # starts on :5173, proxies /api → :3001
```

### Running Tests

```bash
cd backend
npm test
```

> Tests require a live PostgreSQL database configured via `DATABASE_URL`.

---

## Database Schema

```sql
-- releases
CREATE TABLE "Release" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  date            TIMESTAMPTZ NOT NULL,
  "additionalInfo" TEXT,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL
);

-- release_steps
CREATE TABLE "ReleaseStep" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "releaseId" UUID NOT NULL REFERENCES "Release"(id) ON DELETE CASCADE,
  "stepIndex" INTEGER NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT false,
  UNIQUE ("releaseId", "stepIndex")
);
```

### Release Status (computed, not stored)

| Condition             | Status    |
|-----------------------|-----------|
| 0 steps completed     | `planned` |
| 1–9 steps completed   | `ongoing` |
| All 10 steps completed| `done`    |

### Steps (fixed, same for every release)

| # | Label                              |
|---|------------------------------------|
| 0 | Code review completed              |
| 1 | Unit & integration tests passing   |
| 2 | Staging environment deployed       |
| 3 | QA sign-off received               |
| 4 | Documentation updated              |
| 5 | Database migrations ready          |
| 6 | Rollback plan prepared             |
| 7 | Security review done               |
| 8 | Stakeholder approval obtained      |
| 9 | Production deployment scheduled    |

---

## API Endpoints

Base URL: `/api`

### Releases

| Method | Path                              | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | `/releases`                       | List all releases              |
| POST   | `/releases`                       | Create a new release           |
| GET    | `/releases/:id`                   | Get a single release           |
| PATCH  | `/releases/:id`                   | Update additional info         |
| DELETE | `/releases/:id`                   | Delete a release               |
| PATCH  | `/releases/:id/steps/:stepIndex`  | Toggle a step completed state  |

### POST `/releases` — Request body

```json
{
  "name": "v2.5.0",
  "date": "2024-07-15T10:00:00.000Z",
  "additionalInfo": "Optional notes"
}
```

### PATCH `/releases/:id` — Request body

```json
{ "additionalInfo": "Updated notes" }
```

### PATCH `/releases/:id/steps/:stepIndex` — Request body

```json
{ "completed": true }
```

### Release response shape

```json
{
  "id": "uuid",
  "name": "v2.5.0",
  "date": "2024-07-15T10:00:00.000Z",
  "additionalInfo": null,
  "status": "planned",
  "createdAt": "...",
  "updatedAt": "...",
  "steps": [
    { "index": 0, "label": "Code review completed", "completed": false },
    ...
  ]
}
```

---

## Deployment

You can deploy frontend and backend independently:

- **Frontend** (static): Vercel, Netlify, Cloudflare Pages — point to `frontend/` and set build command `npm run build`, output dir `dist`.
- **Backend** (Node): Render, Railway, Fly.io — set `DATABASE_URL` env var pointing to a hosted PostgreSQL instance (e.g. Supabase, Neon, Railway Postgres).

Set `VITE_API_BASE` or configure your CDN/proxy to forward `/api/*` to the backend URL.
