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

### Seeded demo accounts

| Login | Credential |
|---|---|
| Staff (developer role) | `developer@eggspert.local` / `developer123` |
| Staff (teacher role) | `teacher@eggspert.local` / `teacher123` |
| School | code `DEMO001` / `school123` |

## Environment variables

See [`.env.example`](.env.example). `RESEND_API_KEY` and `OPENAI_API_KEY` are only needed once
Phase 3 (applications email) and Phase 4 (AI assistant) land — the app runs without them until
then.

## Architecture notes

- `src/lib/rbac.ts` — `requireRole()` / `requireSchoolAccess()` / `requireStaffPage()`, the single
  place every API route and page goes through for access control. No role switching exists
  anywhere in the UI; role + schoolId come only from the authenticated session.
- `src/lib/auth.ts` — NextAuth config, two Credentials providers (`staff-credentials`,
  `school-credentials`), JWT session strategy.
- `src/lib/storage.ts` — upload adapter interface; `local` driver writes to `public/uploads/` for
  dev, swap `STORAGE_DRIVER` once real object storage exists.
- `src/middleware.ts` — coarse gate redirecting unauthenticated requests to `/backoffice/*` (except
  `/backoffice/login`) back to the login page; per-screen role checks happen server-side in each
  page/route via `requireRole`/`requireStaffPage`.
