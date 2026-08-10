# Eggspert

Next.js 14 (App Router, TypeScript) rebuild of the Eggspert public site + backoffice, per
[`docs/handoff/Engineering-spec.md`](docs/handoff/Engineering-spec.md) and
[`docs/handoff/README.md`](docs/handoff/README.md). The two `.html` files at the repo root are
the original design-reference prototypes — not part of the app, kept for copy/layout reference.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + Postgres
- NextAuth (Credentials): staff login (email+password) and school login (code+password)
- Resend (transactional email), OpenAI (RAG assistant embeddings/generation) — later phases

## Local setup

No Docker/Homebrew/Postgres install required — `npm run db:start` boots a self-contained local
Postgres (binary + data live under `.pgdata/`, gitignored).

```bash
npm install
cp .env.example .env      # already done in this checkout; edit if you need different values
npm run db:start          # leave running in its own terminal
npm run db:migrate        # applies prisma/migrations
npm run db:seed           # creates demo accounts (see below)
npm run dev                # http://localhost:3000
```

Stop the local database with `npm run db:stop` (or Ctrl+C the `db:start` process).

Deploying this somewhere real (hosted Postgres, object storage, Vercel, etc.)? See
[`DEPLOYMENT.md`](DEPLOYMENT.md) — and note that `npm run db:seed` below is dev-only (hardcoded
passwords); production uses `npm run create-admin` instead.

### Seeded demo accounts

| Login | Credential |
|---|---|
| Staff (developer role) | `developer@eggspert.local` / `developer123` |
| Staff (teacher role) | `teacher@eggspert.local` / `teacher123` |
| School | code `DEMO001` / `school123` |

## Environment variables

See [`.env.example`](.env.example). Without `RESEND_API_KEY`, application-submitted emails are
skipped (logged, not fatal). Without `OPENAI_API_KEY`, "ask the Eggspert" tells visitors it's
still being set up instead of answering — the rest of the app works fine either way.

## AI assistant ("ask the Eggspert")

Retrieval-augmented: `LearningArticle` + `News` rows are embedded automatically on create/update
(see `src/lib/ai/index-content.ts`, called from the backoffice API routes) and the project
overview copy is embedded once via a script. `POST /api/ask` embeds the question, does an
in-memory cosine-similarity search over the `Embedding` table (no pgvector — the dataset is small
enough that this is fine), and asks the model to answer only from the retrieved chunks, citing
which ones it used. It never answers from general knowledge.

Once you set `OPENAI_API_KEY`, backfill embeddings for content that existed before the key was
added:

```bash
npm run ai:reindex
```

## IoT

No physical IoT hardware exists yet, so there's no device-authenticated ingestion endpoint.
Readings are logged by hand from the school's IoT tab in the backoffice (same pattern as the egg/
water logs) via `POST /api/schools/[id]/iot-readings`, and both the backoffice dashboard and the
public school insights read the latest real `IotReading` row — no simulated/jittered data anywhere.
`IotDevice.deviceKey` is already in the schema for when real device auth is worth adding.

## Architecture notes

- `src/lib/rbac.ts` — `requireRole()` / `requireSchoolAccess()` / `requireStaffPage()`, the single
  place every API route and page goes through for access control. No role switching exists
  anywhere in the UI; role + schoolId come only from the authenticated session.
- `src/lib/auth.ts` — NextAuth config, two Credentials providers (`staff-credentials`,
  `school-credentials`), JWT session strategy.
- `src/lib/storage.ts` — upload adapter interface; `local` driver writes to `public/uploads/` for
  dev, `s3` driver (AWS S3 / Supabase Storage / R2 / any S3-compatible store) for production —
  set `STORAGE_DRIVER=s3` and the `S3_*` env vars (see `.env.example`).
- `src/middleware.ts` — coarse gate redirecting unauthenticated requests to `/backoffice/*` (except
  `/backoffice/login`) back to the login page; per-screen role checks happen server-side in each
  page/route via `requireRole`/`requireStaffPage`.
