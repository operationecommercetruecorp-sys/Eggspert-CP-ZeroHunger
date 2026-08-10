# Deploying Eggspert

Local dev uses a self-contained embedded Postgres and local-disk file storage — neither is
suitable for production. This is the checklist to move to real infrastructure.

## 1. Hosted Postgres

Pick **[Supabase](https://supabase.com)** or **[Neon](https://neon.tech)** (either works — the
app just needs a standard Postgres connection string). Free tier is enough to start.

1. Create a project.
2. Copy the connection string. Use the **pooled** connection string if the provider offers one
   (Supabase: port `6543` / "Transaction" pooler; Neon: the default connection string already
   pools) — serverless hosting opens many short-lived connections, and Postgres has a hard
   connection limit.
3. Set `DATABASE_URL` in your hosting platform's environment variables to that string.
4. Apply the schema:
   ```bash
   DATABASE_URL="<your production string>" npm run db:migrate:deploy
   ```
   Run this from your machine (or a CI step) — **not** as part of the app's build/start command,
   so it doesn't re-run against production on every preview deploy.

## 2. Object storage (photos, syllabus documents)

Pick one S3-compatible option:

- **Supabase Storage** (simplest if you're already on Supabase for the DB) — create a public
  bucket, then use its S3-compatible endpoint.
- **AWS S3** — create a bucket, put a public-read bucket policy on it (or front it with
  CloudFront), create an IAM user scoped to that bucket only.
- **Cloudflare R2** — create a bucket, enable public access, create an API token.

Set these env vars (see `.env.example` for the full list):

```bash
STORAGE_DRIVER="s3"
S3_BUCKET="..."
S3_REGION="auto"            # real AWS S3: use the actual region, e.g. "us-east-1"
S3_ENDPOINT="..."           # omit entirely for real AWS S3
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL_BASE="..."    # the base URL uploaded files are served from
```

Uploaded photos/documents are rendered with plain `<img src>` / `<a href>`, not signed URLs, so
the bucket (or a CDN in front of it) must allow public read.

## 3. Resend (application-notification emails)

1. Sign up at [resend.com](https://resend.com), verify a sending domain.
2. Create an API key, set `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on your verified domain, e.g. `"Eggspert <notifications@yourdomain.org>"`.

Without this, application submissions still save to the database — the email step just logs a
warning and no-ops.

## 4. OpenAI (the "ask the Eggspert" assistant)

1. Get an API key from [platform.openai.com](https://platform.openai.com).
2. Set `OPENAI_API_KEY`.
3. Backfill embeddings for any content that existed before the key was added:
   ```bash
   OPENAI_API_KEY="..." DATABASE_URL="<production string>" npm run ai:reindex
   ```
   New articles/news are indexed automatically going forward (see `src/lib/ai/index-content.ts`).

Without this key, the chat panel tells visitors it's still being set up instead of answering.

## 5. NextAuth

```bash
NEXTAUTH_SECRET="$(openssl rand -base64 32)"   # generate a fresh one — do not reuse the dev value
NEXTAUTH_URL="https://your-production-domain.org"
```

## 6. Deploy (Vercel)

1. Push this repo to GitHub (already done) and import it in Vercel.
2. Set every env var above in the Vercel project settings (Production, and Preview if you want
   preview deployments to work against a separate database — recommended, so preview builds
   can't touch production data).
3. Deploy. `postinstall` runs `prisma generate` automatically; the build itself doesn't touch the
   database.

Deploying elsewhere (Docker, a plain Node host, etc.) works the same way — set the same env vars
and run `npm run build && npm start`. For a containerized deploy, consider adding
`output: 'standalone'` to `next.config.mjs` to produce a minimal, self-contained server bundle.

## 7. First login — do NOT run the dev seed script

**`npm run db:seed` creates accounts with hardcoded passwords (`developer123`, `admin123`, etc.)
— it's for local dev only. Never run it against a production database.**

Instead, bootstrap exactly one real account with a securely generated password:

```bash
DATABASE_URL="<production string>" npm run create-admin -- \
  --email=you@yourorg.com --nameTh="ชื่อของคุณ" --nameEn="Your Name" --role=developer
```

The password is printed once — save it in a password manager immediately. Sign in at
`/backoffice/login`, then create the rest of your team's accounts from the Access screen (the UI
does the same secure-random-password generation for every account it creates).

## Post-deploy checklist

- [ ] Log in with the bootstrapped account, confirm the dashboard loads
- [ ] Create your school(s) from the Schools screen, note the generated school code/password
- [ ] Confirm a photo/document upload round-trips through real object storage
- [ ] Submit a test application from the public site, confirm the notification email arrives
      (add your own address under Settings → notification emails first)
- [ ] Ask "the Eggspert" a question, confirm it answers and cites a source
- [ ] Delete any test data created above
