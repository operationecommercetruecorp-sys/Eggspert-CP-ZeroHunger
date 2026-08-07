# Handoff: Eggspert — Egg Knowledge Platform + Backoffice

## Overview
A bilingual (TH/EN) educational website for CP Foundation's "Chicken Eggs for School Lunch" program, plus an internal backoffice/admin console. The public site teaches teachers and students about egg nutrition/husbandry, shows program impact stats, lets schools apply to the program, and lets anyone "ask the Eggspert" (an AI assistant scoped to site content). The backoffice manages accounts, school data, content, and program applications across 5 access levels.

## About the Design Files
The files in this bundle (`Eggspert Platform.dc.html` and `Backoffice.dc.html`) are **design references built as static HTML/JS prototypes** — they demonstrate intended layout, copy, interactions, and role-based visibility. They are NOT production code to copy directly: there is no real backend, database, authentication, or email sending behind them (all data is hardcoded mock arrays in the JS; role-switching is a plain dropdown with no security). The task is to **recreate these designs in the target codebase's actual stack** (React/Vue/Next.js etc., with a real backend and auth) using the codebase's established patterns — or, if no stack exists yet, choose an appropriate one (recommended: a React frontend + a backend with a real database — see "Recommended Architecture" below) and implement from scratch using this as the spec.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy (Thai and English), and layout in the prototype are final/intended. Recreate pixel-close using the codebase's component library where one exists; otherwise implement fresh using the design tokens below.

## Design Tokens

**Colors**
- Primary green: `#14663C` (header/nav, primary buttons, links)
- Dark green accent: `#0F4F2E` (dark hero variants)
- Egg-shell background: `#F7F1E3`
- Secondary neutral background: `#F5F1E8` (backoffice canvas)
- Border/hairline: `#E3D9C2`, `#EFE6D2`, `#F0EAD8`
- Text dark: `#1C1A17`
- Text body: `#4a4436`
- Text muted: `#6B6459`
- Text faint: `#9a9284`, `#b3ab9c`
- Accent gold/amber: `#E8A33D` (used sparingly — kicker underline, badges)
- Success green: `#2F8F55` / success bg `#E7F1E9`
- Warning/draft amber: `#8a6a1c` / bg `#FBF0DC`
- Error/reject red: `#B3413E` / bg `#FBEAE9`

**Typography**
- Font: Sarabun (Google Fonts), weights 300–800, supports Thai + Latin
- Headings: 700–800 weight, sizes 26–58px depending on hero vs section
- Body: 400–500 weight, 13–16px, line-height 1.6–1.8
- Small/meta text: 11–13px, muted color

**Radii & shape**
- Cards/panels: 12–16px border-radius
- Buttons/pills: 8–10px (rectangular) or 999px (pill)
- Stat "egg" badges: circular, thick colored border (10–14px)

**Shadows**
- Card elevation: `0 1px 3px rgba(0,0,0,.06)` to `0 6px 20px rgba(28,26,23,.07)`
- Modal: `0 24px 60px rgba(0,0,0,.3)`

## Files
- `Eggspert Platform.dc.html` — public-facing site (single page, all sections)
- `Backoffice.dc.html` — internal admin console (role-driven single page app)

---

## PART 1 — Public Frontend (`Eggspert Platform.dc.html`)

### Language toggle
A TH/EN switch in the header re-renders ALL copy on the page from two parallel string dictionaries (`TH` and `EN` objects in the JS). Recreate as an i18n solution (e.g. next-i18next, react-i18next) with the same two locale files — copy the exact Thai and English strings from the source file's `TH`/`EN` objects verbatim (do not re-translate).

### Screens/Sections (single scrolling page, nav links scroll to anchors)
1. **Header/Nav** — logo mark (small egg-shaped div, `#F7F1E3` fill) + wordmark, nav links (Home/Knowledge/Project/Schools/News) that anchor-scroll to sections, TH/EN pill toggle, "Staff login" link (→ backoffice), Log in / Sign up buttons (green pill on white bg for Sign up).
2. **Hero** — kicker label, H1, subhead, a rounded search bar with placeholder text "ask the Eggspert" + an "Ask" button that opens an AI chat panel (bottom-right floating panel, mocked Q&A with source citation chips). Below: 3 suggestion chips (pill buttons with example questions).
3. **Audience doors** — two side-by-side cards: "For teachers/administrators" and "For students," each with a circular avatar-style badge (currently holds an uploaded character photo cropped so the head/neck breaks out above the circle, body inside) and a CTA link.
4. **Project section** — H2 (project name), 3-line summary paragraph, "See full details" (external link to `https://www.cp-foundationforrural.org/project-p01/`) + "Apply to program" (green button, opens a modal). Photo box (real uploaded photo, object-fit cover). Clicking "See full details" also expands 2 extra paragraphs inline (progressive disclosure) before the external link fires.
5. **Apply to program modal** — form fields (Name, Phone number, Email, Institution name, Institution address) rendered as labeled placeholder inputs; Submit/Cancel buttons. NOTE: in the prototype this is display-only; a real build needs real form inputs + submission to a backend that emails the notification address(es) (see Backoffice → Settings for how that recipient list is managed).
6. **Impact stats circle** — a large circular badge (400px, thick green ring) centered with "1,018 schools," under it the count line "229,502 students, 17,447 education staff, 2,650 communities." Surrounding it: 4 stat cards (students reached, education staff, communities, eggs per cycle). This exact number set is what the Backoffice → Project Results screen manages (see Part 2).
7. **Find your school** — search bar (mock, always shows one placeholder query) + list of school result rows (photo swatch, name, join-year meta, "eggs/day" figure, "View school" button). Clicking "View school" opens a modal showing: a 7-day egg-production bar chart (mock data), then either an insights grid (if "logged in") or a login gate (school code + password inputs, "Log in" button) that reveals the insights grid on click. Insights shown once logged in: avg. house temperature, humidity, water used today, feed used today, weekly egg-sale revenue, lay rate — each with a trend note.
8. **Knowledge library** — H2 + "See all" link, grid of 7 topic cards. Each card has a small stat pair (e.g. "6g protein per egg" / "78 kcal per egg") instead of a plain photo, real sourced facts (Thai egg grading sizes 0–5, 60-week flock cycle, 16hr lighting, feed ratios, IoT sensor set, etc — see JS `topics` array for exact copy per language).
9. **Footer** — dark green bar, address, two link columns (Knowledge links, Project links).

### Interactions/state (from the JS logic class)
- `lang`: "th" | "en" — toggles all copy
- `projOpen`: boolean — expands the 2 extra project paragraphs
- `formOpen`: boolean — shows/hides apply-to-program modal
- `chatOpen`: boolean — shows/hides AI assistant panel
- `schoolOpen`, `schoolIdx`, `schoolLoggedIn`: which school's modal is open and whether its login gate has been passed (mock; resets to logged-out every time a school is opened)

### AI Assistant ("ask the Eggspert")
Prototype shows one hardcoded Q&A pair with 2 "source" chips citing which knowledge-library article backed the answer. Real implementation: an LLM call scoped ONLY to this site's own content (Knowledge Library articles + News + Project info) — retrieval should be constrained to first-party content, not general web knowledge, and answers should cite the specific article/news item used.

---

## PART 2 — Backoffice (`Backoffice.dc.html`)

### Access layers (must be enforced server-side, not client-side)
1. **Developer** — full code/data access, everything below plus underlying system access.
2. **Admin** — full data CRUD + export + delete everywhere; can authorize new user accounts; **capped at 5 admin accounts max** (UI shows "3 / 5" usage and disables "add admin" at the cap — this cap must also be enforced server-side).
3. **CP user** — can view/export any data; can grant/revoke teacher and student access on any school; can create schools and fill Project Results; cannot manage Admins and cannot see Settings (notification emails).
4. **Teacher** — scoped to their own single school only; can grant/revoke STUDENT accounts on their school only (not other teachers); can update their school's egg/water/feed logs, upload photos, manage syllabus/homework (create/edit/publish), and write news for their school only.
5. **Student** — scoped to their own single school only, view/download only (syllabus/homework, news, dashboards) — no edit rights anywhere.

Account creation for Teacher/Student MUST require selecting a specific school (this is a required field in the "Add teacher/student" flow) — the account is meaningless without that school binding, since it drives all of that user's downstream visibility.

### Screens
1. **Overview/Dashboard** — role-specific stat cards (org-wide stats for managers; own-school stats for teacher/student). Managers additionally see an admin-seat-usage banner and a "recent applications" preview list linking to the Applications screen.
2. **Applications** (Developer/Admin/CP only) — table of program sign-up applications (name, school, phone, email, date, status) with inline Approve/Reject actions that update status. This is where "Apply to program" and "Sign up" submissions from the public site should land.
3. **Access & Users** (all roles, but scoped) — tabbed: "Admins" (Developer/Admin only, 5-seat cap, add/remove), "CP users" (Developer/Admin only, add/remove), "Teachers & students" (Developer/Admin/CP: global list across all schools; Teacher: implicitly scoped to their own school via the school-detail screen's Users tab instead). Add-user flow requires: role, school (required for teacher/student), full name in Thai AND English, phone, email, optional photo. One teacher per school can be flagged "main contact."
4. **Project Results** (Developer/Admin/CP only) — historical entries feeding the public homepage's impact-stats circle. Fields per entry: update date, provinces (multi-select — frontend just shows the COUNT, e.g. "74 provinces"), countries (multi-select — frontend shows the count only if more than 2 are selected, otherwise implicit "1"), school count, student count, education-staff count, community count, eggs-per-cycle. New entries prepend to history; only the latest entry should drive the live public homepage numbers.
5. **Schools** (Developer/Admin/CP only, list view) — table of all schools (name, location, joined date — auto-set to account-creation date, teacher/student counts) with Create School (name + location only — required fields), CSV Import, and CSV Export actions.
6. **School Detail** (reached via Schools list for managers, or directly as "My School" for teacher/student) — tabbed:
   - **Overview**: quick stats (today's eggs, teacher/student counts, IoT device count, published-document count)
   - **Users** (hidden for student role): teacher list (view) + student list (add/remove) — teacher's own add/remove is scoped to students only
   - **Egg production**: 7-day bar chart + "log today" action (teacher/manager only; student views only)
   - **Water/feed**: historical order+consumption log table + "add entry" action (teacher/manager only)
   - **IoT devices**: a live-looking dashboard (temperature, humidity, water-used-today, feed-remaining — prototype jitters these with a client-side timer to simulate real-time; a real build should poll/subscribe to actual device telemetry) + a static device list table (name, type, status, install date)
   - **Photos**: gallery of hen-house photos with publish date; upload restricted to teacher (and managers)
   - **Syllabus/homework**: list of documents with type (lesson plan / worksheet / quiz) and status (draft/published); teacher can upload + toggle publish; student sees published-only with a Download action
   - **News**: per-school news list (title, date, body); teacher (and managers) can write; everyone can read
7. **Learning Center** (Developer/Admin/CP only) — manages the public site's knowledge-library articles (topic tag, title, body, image). This content is what the public "ask the Eggspert" assistant should retrieve from.
8. **News (global)** (Developer/Admin/CP only) — cross-school news feed with a school filter, plus "write news for any school" (with a required school-select field, unlike the per-school Teacher flow which is implicitly scoped).
9. **Settings** (Developer/Admin ONLY — CP excluded) — manages the list of notification email addresses that receive new-application alerts. Email subject format (Thai): `มีผู้สมัครใหม่ โครงการไก่ไข่เพื่ออาหารกลางวันนักเรียน วันที่ [application date]`. Supports multiple recipients; add/remove UI.

### Cross-cutting interaction notes
- A role switcher in the prototype sidebar is a DEV-ONLY convenience with no security meaning — in production this must be replaced entirely by real authenticated sessions; there should be no way for a logged-in user to change their own role from the UI.
- "Log out" in the sidebar returns to the public frontend's URL.
- All "Add X" actions in the prototype are mocked (they push a placeholder row into local state); real forms need actual input fields, validation, and API calls.
- IoT numbers are simulated via `Math.sin()` jitter on a timer — replace with real telemetry ingestion (e.g., MQTT/HTTP webhook from devices → time-series store → dashboard query).

## Recommended Architecture (if none exists yet)
- Frontend: React (Next.js) for both public site and backoffice, sharing a design-token/theme file derived from the tokens above.
- Backend: a real database (Postgres via Supabase, or similar) with tables for schools, users (with role + school_id + main_contact flag), applications, project_results (historical), learning_articles, news, syllabus_documents, egg_logs, water_feed_logs, iot_readings, iot_devices, notification_emails.
- Auth: real session-based auth (e.g. NextAuth/Supabase Auth) with server-side role + school-scoping checks on every query and mutation — the 5-admin cap and school-scoping rules must be enforced in the backend, not just hidden in the UI.
- Email: a transactional email provider (e.g. Resend/SendGrid) triggered server-side on new application submission, sending to the dynamic recipient list from Settings.
- File storage: object storage (e.g. S3/Supabase Storage) for photos and syllabus/homework documents.
- AI assistant: retrieval scoped to Learning Center articles + News + Project info only (e.g. embed and search first-party content, do not let it answer from general web knowledge).
