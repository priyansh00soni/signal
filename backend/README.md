# Endpoint Health Monitoring — Backend

## What I Built

An API that tracks heartbeats from machines and reports whether each one
is currently online or offline.

- `POST /api/v1/heartbeats` — body `{ machineName: string }`. Upserts the
  machine (creates on first heartbeat, otherwise bumps `lastSeenAt`).
  `201` on create, `200` on update.
- `GET /api/v1/machines` — all machines, each with a computed `isOffline`
  flag. **Sorted most-recently-seen first.**
- `GET /api/v1/machines/:id` — single machine, same shape. `404` if not
  found.
- `GET /health` — plain liveness check, not under `/api/v1`.

Every response follows `{ success, data, message, errors }`.

### Offline detection

`OFFLINE_THRESHOLD_SECONDS = 30` (see `src/config/constants.ts`). A
machine is considered offline once `now - lastSeenAt >= 30s` — **the
boundary itself counts as offline**, not online. `isOffline` is always
computed on read, never stored as a column.

The check lives as a pure function (`src/machines/isMachineOffline.ts`)
with no DB or Express dependency, so it's unit-tested in isolation.

### Project structure

Feature-folder layout per `backend-guidelines.md`: routes wire up
method+path+middleware+controller only; controllers call the service,
shape the response, and forward errors; services hold all business logic
and DB access; `ApiError` + one centralized `errorHandler` (which also
translates Prisma's `P2002`/`P2025` codes) handle every error path.

```
src/
  machines/
    machines.routes.ts
    machines.controller.ts
    machines.service.ts
    machines.validation.ts
    isMachineOffline.ts
  middleware/
    errorHandler.ts
    notFound.ts
    validateBody.ts
  utils/
    ApiError.ts
  config/
    db.ts
    constants.ts
  app.ts
  server.ts
```

## Why This Stack

TypeScript, Express, Prisma, PostgreSQL, Vitest + supertest. No auth, no
Zod, ESM throughout.

**Prisma over raw SQL** — the schema is one table with three fields. Raw
SQL would mean hand-writing migrations and query strings for something
this small; Prisma gives typed queries and migration files basically for
free, and the extra layer is cheap at this scale. **PostgreSQL over
MongoDB** — a machine is a fixed, flat set of typed fields with a unique
constraint (`machineName`); that's relational/tabular data, not
document-shaped, so there's no real case for a document store here.
**No Zod** — validation is one rule ("`machineName` is a non-empty
string"). A schema library earns its keep once you have several
fields, nested shapes, or reused schemas across endpoints; for a
three-line manual check, it's overhead without benefit.

## How to Run Locally

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Server starts on `PORT` (default `4000`).

### Tests

```bash
npm test
```

`test/isMachineOffline.test.ts` covers the pure function directly (no
mocking needed). `test/heartbeats.test.ts` and `test/machines.test.ts` are
API-level tests via supertest, mocking the Prisma client at the module
boundary (`src/config/db.ts`) — see **Trade-offs** below for why.

10 tests total, covering: offline/online/boundary cases, idempotent
heartbeat upsert (same `machineName` twice → one row, newer timestamp),
missing-field validation, and `isOffline` correctness on both list and
single-machine reads (including 404).

### A note on this environment's Prisma client generation

`npx prisma generate` requires fetching engine binaries from
`binaries.prisma.sh`, which wasn't reachable in the sandbox this was
built in — so `npx tsc --noEmit` currently shows a handful of type errors
that trace directly back to the placeholder (un-generated) Prisma client
having incomplete types (e.g. `Prisma.PrismaClientKnownRequestError` not
yet exported, `findMany` returning `any[]`). These are **not real code
issues** — running `npx prisma migrate dev` or `npx prisma generate`
against your actual `DATABASE_URL` in a normal environment will generate
the schema-specific client and resolve them. The test suite itself passes
cleanly since it mocks Prisma entirely and never touches the real client.

## Trade-offs

Deliberate simplifications made for a small, non-production project:

- **No auth.** Explicitly out of scope per the brief — every endpoint is
  open. A real deployment would need at least a shared secret or API key
  on the heartbeat endpoint.
- **Polling over WebSockets.** The frontend is expected to poll
  `GET /machines` on an interval rather than the backend pushing updates.
  Simpler to build and reason about, and sufficient at this scale — a
  handful of machines, no need for sub-second updates.
- **`isOffline` computed on read, not stored or cron-updated.** No
  background job flips a status column, and there's no column to go
  stale. The trade-off is a small amount of repeated computation on every
  read (trivial for a handful of rows) in exchange for eliminating an
  entire class of bug: a cron job that didn't run, or a stored flag that
  drifts from the actual `lastSeenAt`.
- **Tests mock Prisma at the module boundary instead of using a real test
  database.** Faster to run and portable — no Postgres instance required
  in CI or a sandbox — while still exercising the real routes →
  controllers → services → response-shape path. If true integration
  tests against a real database are preferred, swap the
  `vi.mock('../src/config/db.js', ...)` blocks for a dedicated test
  schema and drop the mock.

## What's intentionally not here

No rate limiting, no logging framework, no Docker, no CI config. Small
project, kept small.
