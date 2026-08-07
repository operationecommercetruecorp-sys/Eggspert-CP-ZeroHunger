# Engineering Spec — Eggspert Platform (Next.js build)

This is the implementation plan for turning the HTML design references (`Eggspert Platform.dc.html`, `Backoffice.dc.html`) into a real, deployed Next.js app with auth, a database, role-based access, and email notifications. Hand this whole folder to Claude Code as the starting brief.

Repo: `operationecommercetruecorp-sys/Eggspert-CP-ZeroHunger` (currently contains only the two static prototype HTML files — this is a greenfield build inside that repo, not a migration).

## Stack

- **Framework**: Next.js 14+ (App Router), TypeScript
- **DB**: Postgres (Supabase or Neon) + Prisma ORM
- **Auth**: NextAuth.js (Credentials provider — school code+password for schools, email+password for staff), sessions via JWT or DB sessions
- **Email**: Resend (or SendGrid) — transactional, triggered server-side on application submit
- **File storage**: Supabase Storage or S3 — photos, syllabus/homework docs
- **i18n**: next-intl or a simple TH/EN JSON dictionary switch (copy the `TH`/`EN` objects verbatim from `Eggspert Platform.dc.html`'s script into `messages/th.json` / `messages/en.json`)
- **Styling**: Tailwind CSS, tokens below

## Design tokens

Colors: primary green `#14663C`, dark green `#0F4F2E`, egg-shell bg `#F7F1E3`, backoffice canvas `#F5F1E8`, borders `#E3D9C2`/`#EFE6D2`/`#F0EAD8`, text dark `#1C1A17`, text body `#4a4436`, text muted `#6B6459`, text faint `#9a9284`/`#b3ab9c`, accent gold `#E8A33D`, success `#2F8F55`/bg `#E7F1E9`, warning `#8a6a1c`/bg `#FBF0DC`, error `#B3413E`/bg `#FBEAE9`.
Font: Sarabun (Google Fonts, 300–800). Radii: cards 12–16px, buttons 8–10px or pill 999px.

## Roles & access control (enforce server-side — every API route and page)

1. **developer** — full access, including underlying system/data.
2. **admin** — full CRUD everywhere, authorizes new accounts, capped at **5 admin accounts** (enforce in DB constraint or app-level check on create).
3. **cp** — view/export all data, grant/revoke teacher & student accounts on any school, create schools, fill Project Results. No admin management, no Settings.
4. **teacher** — scoped to own `school_id` only. Can add/remove students at own school (not teachers), update egg/water/feed logs, upload photos, manage syllabus/homework, write school news.
5. **student** — scoped to own `school_id`, read/download only.

Middleware pattern: attach `role` and `schoolId` to the session; every data-mutating query filters by `schoolId` unless role is developer/admin/cp. Do this in a shared `requireRole()`/`requireSchoolAccess()` helper used by every API route, not just hidden in the UI.

## Data model (Prisma schema sketch)

```prisma
model User {
  id            String   @id @default(cuid())
  role          Role     // developer | admin | cp | teacher | student
  email         String?  @unique
  passwordHash  String
  nameTh        String
  nameEn        String
  phone         String?
  photoUrl      String?
  isMainContact Boolean  @default(false)
  schoolId      String?
  school        School?  @relation(fields: [schoolId], references: [id])
  createdAt     DateTime @default(now())
}

model School {
  id            String   @id @default(cuid())
  name          String
  location      String
  joinedDate    DateTime @default(now())
  code          String   @unique   // school login code
  passwordHash  String             // shared school login (used by the public "Find your school" login gate)
  users         User[]
  eggLogs       EggLog[]
  waterFeedLogs WaterFeedLog[]
  iotDevices    IotDevice[]
  iotReadings   IotReading[]
  photos        Photo[]
  documents     SyllabusDoc[]
  news          News[]
}

model Application {
  id        String   @id @default(cuid())
  name      String
  school    String
  phone     String
  email     String
  address   String
  status    Status   @default(PENDING) // PENDING | APPROVED | REJECTED
  createdAt DateTime @default(now())
}

model ProjectResult {
  id            String   @id @default(cuid())
  updateDate    DateTime
  provinces     Int
  countries     Int
  schoolCount   Int
  studentCount  Int
  staffCount    Int
  communityCount Int
  eggsPerCycle  String
  createdAt     DateTime @default(now())
}

model EggLog       { id String @id @default(cuid()) schoolId String school School @relation(fields:[schoolId],references:[id]) date DateTime count Int }
model WaterFeedLog { id String @id @default(cuid()) schoolId String school School @relation(fields:[schoolId],references:[id]) date DateTime type String action String amount String }
model IotDevice    { id String @id @default(cuid()) schoolId String school School @relation(fields:[schoolId],references:[id]) name String type String status String installedAt DateTime }
model IotReading   { id String @id @default(cuid()) deviceId String device IotDevice @relation(fields:[deviceId],references:[id]) temp Float humidity Float water Float feed Float recordedAt DateTime @default(now()) }
model Photo        { id String @id @default(cuid()) schoolId String school School @relation(fields:[schoolId],references:[id]) url String publishedAt DateTime @default(now()) }
model SyllabusDoc  { id String @id @default(cuid()) schoolId String school School @relation(fields:[schoolId],references:[id]) title String type String fileUrl String status String @default("draft") createdAt DateTime @default(now()) }
model News         { id String @id @default(cuid()) schoolId String? school School? @relation(fields:[schoolId],references:[id]) title String body String createdAt DateTime @default(now()) }
model LearningArticle { id String @id @default(cuid()) tag String title String body String imageUrl String? createdAt DateTime @default(now()) }
model NotificationEmail { id String @id @default(cuid()) email String @unique }

enum Role { developer admin cp teacher student }
enum Status { PENDING APPROVED REJECTED }
```

## Key flows to implement

**Public "Apply to program" form** → `POST /api/applications` → creates `Application` row, sends email to every row in `NotificationEmail` via Resend. Subject (Thai, keep verbatim): `มีผู้สมัครใหม่ โครงการไก่ไข่เพื่ออาหารกลางวันนักเรียน วันที่ [application date]`.

**School login gate** (public site, "Find your school" modal) → school code + password → verify against `School.code`/`passwordHash` → issue a scoped session that unlocks the insights grid for that one school only.

**Backoffice auth** → real login page (replaces the prototype's role dropdown entirely — that dropdown must not exist in production). Staff sign in with email+password; session carries `role` + `schoolId`.

**IoT dashboard** → replace the `Math.sin()` jitter with a real ingestion endpoint (`POST /api/iot/readings`, authenticated by device key) that devices push to, storing rows in `IotReading`; the dashboard queries latest reading per device.

**AI assistant ("ask the Eggspert")** → retrieval-augmented: embed `LearningArticle` + `News` + project copy, retrieve top matches for the user's question, generate an answer that cites the specific article(s) used. Do not let it answer outside first-party content.

**Project Results → homepage stats** → only the most recent `ProjectResult` row (by `updateDate`) feeds the public impact-stats circle and stat cards.

## Suggested route map

- `/` — public site (all sections from `Eggspert Platform.dc.html`)
- `/backoffice/login` — staff login
- `/backoffice` — dashboard (role-gated redirect logic)
- `/backoffice/applications`
- `/backoffice/access` (admins / cp-users / teachers-students tabs)
- `/backoffice/project-results`
- `/backoffice/schools`, `/backoffice/schools/[id]` (tabs: overview/users/eggs/water/iot/photos/syllabus/news)
- `/backoffice/learning`
- `/backoffice/news`
- `/backoffice/settings` (admin/developer only)

Mirror this with `/api/*` REST routes (or a tRPC router) — one resource per model above, each wrapped in the role/school-scope guard.

## Screen map (source → target)

| Screen | Source file section | Notes |
|---|---|---|
| Public site all sections | `Eggspert Platform.dc.html` (single file, `TH`/`EN` objects) | Split into components per section; move copy to i18n JSON verbatim |
| Backoffice all screens | `Backoffice.dc.html` (single file, `renderVals()` logic) | Split into pages per route above; replace role-dropdown + mocked "Add X" actions with real forms + API calls |

## What NOT to carry over as-is

- The sidebar role `<select>` — no such control in production; role comes from the authenticated session only.
- All `openModal`/`submitModal` mock handlers that push placeholder rows into local state — replace with real forms (react-hook-form + zod validation) posting to the API routes above.
- The `Math.sin()` IoT jitter — replace with real telemetry.
