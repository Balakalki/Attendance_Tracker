# Attendance Tracker

A full-stack web app that lets **BTech students** build a weekly class timetable, mark daily attendance, and track their attendance percentage per subject — with classes and labs weighted differently per university rules.

> **Demo:** https://attendancetracker-abk.vercel.app
> **Demo login:** `aluribalakalki5@gmail.com` / `123456`

> 📌 **This README is the single source of truth for the project.** Whenever we change the architecture, data model, API, or workflow, update this file in the same change so it never goes stale.

---

## Table of Contents
1. [What the App Does](#what-the-app-does)
2. [Tech Stack](#tech-stack)
3. [Repository Layout](#repository-layout)
4. [Architecture Overview](#architecture-overview)
5. [Data Model](#data-model)
6. [Backend Reference](#backend-reference)
7. [Frontend Reference](#frontend-reference)
8. [Key Business Logic](#key-business-logic)
9. [Authentication & Security](#authentication--security)
10. [Environment Variables](#environment-variables)
11. [Running Locally](#running-locally)
12. [Deployment](#deployment)
13. [Known Quirks / Tech Debt](#known-quirks--tech-debt)

---

## What the App Does

- **Sign up with email OTP verification** (OTP emailed via Gmail/nodemailer, valid 15 min).
- **Configure a timetable**: set class/lab durations, start/end times, and lunch break — the app auto-generates time **slots**.
- **Add subjects** (type `class` or `lab`) and assign them to slots per weekday in a grid.
- **View** the weekly timetable as a table (consecutive same-subject slots are merged with `colSpan`).
- **Mark attendance** per slot for any date (current or past) via a date picker. The subject for a slot can be overridden before marking (handles substitutions/cancellations).
- **Dashboard** shows total/attended/missed classes and overall + per-subject attendance percentage, with color-coded thresholds (≥75% good, ≥65% warning, else danger).
- **Forgot/reset password** via the same OTP flow.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, React Router 7, Tailwind CSS 4, shadcn/ui (Radix UI primitives, "new-york" style), lucide-react icons |
| Forms / data | react-hook-form, axios, date-fns, dayjs, @tanstack/react-table, sonner (toasts) |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas via Mongoose 8 |
| Auth | JWT (jsonwebtoken) in an httpOnly cookie; passwords hashed with **bcrypt** (bcryptjs); OTPs bcrypt-hashed |
| Email | nodemailer (Gmail service) |
| Backend hosting | AWS Lambda via Serverless Framework v4 (`serverless-http`), region `ap-south-1`; also has a Dockerfile for the AWS Lambda Node base image |
| Frontend hosting | Vercel (SPA rewrites, `@vercel/analytics`) |
| Analytics mgmt | Jira (solo developer) |

> **Note:** Frontend is JavaScript (`.jsx`), not TypeScript (`tsx: false` in `components.json`), though `@types/*` packages are installed.

---

## Repository Layout

```
Attendance_Tracker/
├── README.md                     ← this file
├── Docs/                         ← original design docs (overview, schema, API, setup)
│
├── attendanceTrackerBakeEnd/     ← BACKEND (Express + Lambda)
│   ├── index.js                  ← Express app: middleware + route mounting (exports app)
│   ├── handler.js                ← Lambda entrypoint (serverless-http + cached DB connection)
│   ├── test.js                   ← Local dev entrypoint (app.listen on PORT)
│   ├── connection.js             ← Mongoose connection helper (cached / reused)
│   ├── serverless.yml            ← Serverless Framework config (AWS Lambda, proxy any route)
│   ├── Dockerfile                ← AWS Lambda Node 22 base image
│   ├── routes/                   ← Express routers (auth, timeTable, attendance, summary, otp)
│   ├── controller/               ← Route handlers / business logic
│   ├── model/                    ← Mongoose schemas (user, timeTable, slots, subjects, attendance, otpModel)
│   ├── middlewares/
│   │   └── authentication.js     ← checkIsAuthentic: reads JWT cookie → req.user
│   └── service/
│       ├── authentication.js     ← createToken / verifyToken (JWT)
│       └── mailSender.js         ← nodemailer Gmail transport
│
└── attendance_portal_fontend/    ← FRONTEND (React + Vite)  [note: "fontend" typo in dir name]
    ├── vite.config.js            ← Vite + React + Tailwind, "@" alias → ./src
    ├── components.json           ← shadcn/ui config
    ├── vercel.json               ← SPA rewrites + build config (--legacy-peer-deps)
    └── src/
        ├── main.jsx              ← Root render, BrowserRouter, Vercel analytics
        ├── App.jsx               ← Routes
        ├── pages/                ← Dashboard, Attendance, Timetable, LogIn, SignUp, Password, Home
        ├── components/
        │   ├── layouts/          ← MainLayout (sidebar shell), Sidenav, NavLayout
        │   ├── timetable/        ← TimetableView, TimetableConfig, TimetableEdit, ManageTimetable, AddTimetable
        │   ├── attendance/       ← AttendanceForm, SubjectSelector
        │   └── ui/               ← shadcn/ui primitives (button, card, select, table, etc.)
        ├── hooks/use-mobile.js
        └── lib/utils.js          ← cn() classname helper
```

---

## Architecture Overview

```
┌─────────────────────────┐         axios (withCredentials)        ┌──────────────────────────┐
│   React SPA (Vercel)     │  ───────────────────────────────────► │  Express API (AWS Lambda) │
│   VITE_SERVER_URL/api    │  ◄─────────────────────────────────── │  serverless-http proxy    │
└─────────────────────────┘        JSON + httpOnly JWT cookie      └────────────┬─────────────┘
                                                                                 │ Mongoose
                                                                                 ▼
                                                                      ┌──────────────────────┐
                                                                      │   MongoDB Atlas       │
                                                                      └──────────────────────┘
```

- The **frontend** calls the API base URL from `import.meta.env.VITE_SERVER_URL`, always with `withCredentials: true` so the JWT cookie travels.
- Every request passes through `checkIsAuthentic`, which decodes the JWT cookie into `req.user` (or `null`). Controllers gate on `req.user?.id`.
- On Lambda, `handler.js` connects to Mongo only on cold start and caches both the DB connection and the wrapped Express app. There's also a body-parsing shim in `index.js` for API Gateway base64 bodies.

---

## Data Model

All collections are scoped per user via `userId`. (Mongoose model name → MongoDB collection.)

### `users` (model/user.js)
| Field | Type | Notes |
|-------|------|-------|
| fullName | String | required |
| email | String | required, **unique** |
| password | String | **bcrypt** hash (set in async `pre("save")`) |
| salt | String | legacy HMAC salt; only on pre-bcrypt accounts, cleared on first login |
| isVerified | Boolean | default false; set true on signup after OTP |
| timestamps | | createdAt / updatedAt |

- Static `User.matchPassword(email, password)` returns `{ id, email, isVerified }` or throws. If the stored hash is bcrypt (`$2…`) it uses `bcrypt.compare`; if it's a legacy HMAC-SHA256 hash, it verifies the old way and then **transparently re-hashes with bcrypt on success** (rehash-on-login), so old accounts (incl. the demo login) keep working and upgrade automatically.

### `timeTables` (model/timeTable.js)
One per user (`userId` unique).
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId → users | unique |
| startTime / endTime | String | "HH:MM" |
| classTime / labTime | Number | minutes |
| lunchBreak | `{ startTime, endTime }` | "HH:MM" |
| days | `{ Monday..Sunday: [classSchema] }` | each entry `{ slotId → slots, subjectId → subjects }` (subjectId optional, `_id: false`) |

### `slots` (model/slots.js)
Generated time blocks for a user's day.
| Field | Type | Notes |
|-------|------|-------|
| time | String | e.g. `"9:30 AM - 10:15 AM"` |
| userId | ObjectId → users | |
| sortId | Number | ordering |
| | | compound unique index on `{ time, userId, sortId }` |

### `subjects` (model/subjects.js)
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| userId | ObjectId → users | |
| type | String | enum `["class", "lab"]` |
| timestamps | | createdAt / updatedAt (dashboard orders subjects by createdAt) |
| | | compound unique index on `{ userId, name }` |

> **Counts are NOT stored here.** `total`/`attended` per subject are **derived from the `attendance` collection** (single source of truth) via an aggregation in `handleGetSummary` — so they can never drift out of sync. The summary response adds computed `total`/`attended` onto each subject for the dashboard. Lab counts are then **scaled at read time** on the dashboard by `classTime / labTime` (a lab "hour" counts as multiple class periods).

### `attendance` (model/attendance.js)
One record per user/date/slot.
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId → users | |
| date | String | **`"YYYY-MM-DD"`** date-only string (timezone-safe; sorts chronologically). Validated by regex. |
| slotId | ObjectId → slots | (consistent with timetable refs) |
| subjectId | ObjectId → subjects | (consistent with timetable refs) |
| status | String | enum `["Present", "Absent"]` |
| timestamps | | createdAt / updatedAt |
| | | compound unique index on `{ userId, date, slotId }` |

### `OTP` (model/otpModel.js)
| Field | Type | Notes |
|-------|------|-------|
| email | String | unique (one active OTP per email; re-request **upserts**) |
| otp | String | **bcrypt hash** of the 6-digit code (never plaintext) |
| isVerified | Boolean | default false |
| createdAt | Date | **TTL: expires after 900s (15 min)**; reset to now on each re-issue |

---

## Backend Reference

All routes are mounted in `index.js`. Auth is via the JWT cookie (`req.user` set by middleware). Base path: `/api`.

### Auth — `routes/auth.js` → `controller/auth.js`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/auth/signup` | handleCreateUser | Requires a **verified OTP** for the email first; creates user. |
| POST | `/api/auth/login` | handleAuthenticateUser | Validates password, sets httpOnly JWT cookie (24h). |
| POST | `/api/auth/logout` | handleLogOut | Clears cookie. |
| POST | `/api/auth/password` | handleChangePassword | Reset password (requires verified OTP for email). |
| GET | `/api/auth` | handleGetUser | Returns logged-in user's `fullName`. |

### Timetable — `routes/timeTable.js` → `controller/timeTable.js`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/timetable` | handleConfigTimeTable | Save config (durations, times, lunch); regenerates `slots` (deletes old timetable + slots first). |
| GET | `/api/timetable` | handleGetTimeTable | Returns `{ timeTableData, slots, subjects, attendance }`. Optional `?day=&date=` narrows projection/populates that day and fetches attendance for the date. |
| PUT | `/api/timetable` | handleCreateTimeTable | Updates the `days` grid (subject↔slot assignments). |
| POST | `/api/timetable/subject` | handleAddSubject | Create a subject (`{ name, type }`). |
| DELETE | `/api/timetable/subject/:id` | handleDeleteSubject | Delete subject, pull it from all days, and delete its attendance records. |

### Attendance — `routes/attendance.js` → `controller/attendance.js`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/attendance` | handlePostAttendance | Atomic upsert of attendance for `{ date, class: { slotId, subjectId, status } }` keyed on `{ userId, date, slotId }`. Handles both first-mark and subject/status changes in one write. No counters to maintain — counts are derived on read. Validates `date` is `YYYY-MM-DD`. |

### Summary — `routes/summary.js` → `controller/summary.js`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/api/summary` | handleGetSummary | Returns all subjects, each enriched with `total`/`attended` **aggregated from the attendance collection**, plus `classTime`/`labTime` for percentage math. |

### OTP — `routes/otp.js` → `controller/otp.js`
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/api/otp` | handleGenerateOTP | Generate + email a 6-digit OTP; **upserts** a bcrypt-hashed record per email and resets the 15-min TTL (re-requesting never errors). |
| POST | `/api/otp/verify` | handleVerifyOTP | `bcrypt.compare` the submitted code; set `isVerified` on the record. Returns a clear message if the record is missing/expired. |

> The original `Docs/api-documentation.md` describes a planned `/api/bunks/:userId` "bunk calculator" and `PUT /api/attendance` — **not implemented** in the current code.

---

## Frontend Reference

### Routes (`src/App.jsx`)
| Path | Page | Layout |
|------|------|--------|
| `/` | Dashboard | MainLayout |
| `/attendance` | Attendance | MainLayout |
| `/timetable` | Timetable | MainLayout |
| `/signup` | SignUp | — |
| `/login` | LogIn | — |
| `/forgot-password` | Password | — |

- **MainLayout** (`components/layouts/MainLayout.jsx`): sidebar shell (Dashboard/Attendance/Timetable nav + Logout), fetches `GET /api/auth` for the username, shows avatar initials, hosts the `<Toaster />`.
- Pages redirect to `/login` on a `401` response.

### Page responsibilities
- **Dashboard**: fetches `/api/summary`, scales lab counts by `classTime/labTime`, computes overall + per-subject %, renders cards + progress bars with threshold colors.
- **Attendance**: date picker drives `GET /api/timetable?day=&date=`; renders a card per slot with a subject `<Select>` and Present/Absent radio; `POST /api/attendance` per slot.
- **Timetable**: tabbed — *View* (`TimetableView`) and *Manage* (`ManageTimetable` → `TimetableConfig` + `TimetableEdit`).
  - `TimetableConfig`: sets durations/times/lunch and **client-side generates slots** (skips lunch overlap), then `POST /api/timetable`.
  - `TimetableEdit`: add/delete subjects and assign subjects to slots per day grid, then `PUT /api/timetable`.
  - `TimetableView`: read-only weekly grid, merges consecutive equal subjects via `colSpan`.
- **Auth pages (LogIn / SignUp / Password)**: redesigned with a shared split-screen layout — a violet gradient brand panel + a clean white form card. Logic is unchanged (react-hook-form, axios, the OTP verify flow); only presentation changed.
  - `components/auth/AuthLayout.jsx`: the split-screen shell (brand panel on `lg+`, compact brand header on mobile), takes `title` / `subtitle` / `children` / `footer`.
  - `components/auth/AuthField.jsx`: shared form primitives — `FieldShell`, `IconInput`, `PasswordInput` (show/hide toggle), `Alert`, `StatusText`, and the `primaryButtonClass` / `ghostActionClass` / `inputClass` style constants. **Reuse these when building the other pages** to keep one design language.

### Design System
- **Tailwind v4** with tokens in `src/global.css`. The token set is now **complete** — `:root` defines the full shadcn palette (`primary`, `primary-foreground`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `radius`, card/popover) and `@theme` maps each to a `--color-*` utility. (Previously several of these were missing, so shadcn primitives like `border-input` / `text-primary-foreground` / `ring-ring` silently rendered no styles.)
- **Brand color:** violet — `--primary: 256 72% 58%`. A `@layer base` sets the default border color, body background/foreground, and font smoothing.
- `src/App.css` is unused Vite boilerplate (not imported anywhere).

---

## Key Business Logic

### Slot generation (`TimetableConfig.handleConfigSave`)
Walks from `startTime` to `endTime` in `classTime`-minute steps, skipping any slot that overlaps the lunch break, formatting each as `"h:mm AM/PM - h:mm AM/PM"` with an incrementing `sortId`.

### Attendance counts (derived, not stored)
- `handlePostAttendance` just **upserts** one record per `{ userId, date, slotId }` — marking, changing the subject, or flipping Present/Absent are all the same single atomic write.
- `handleGetSummary` computes per-subject `total` (count of records) and `attended` (count where `status === "Present"`) with a `$group` aggregation over the `attendance` collection. The attendance records are the single source of truth, so counts can never drift.

### Lab weighting (Dashboard)
`lab = classTime / labTime`; for `type === "lab"` subjects, `total` and `attended` are multiplied by `lab` before aggregating — so a 60-min lab with 45-min classes counts as 1.33 periods.

### Attendance thresholds
- Badge color: ≥75% success, ≥65% warning, else danger.
- Progress color: ≥85% green, ≥75% amber, else red.

---

## Authentication & Security

- **Password hashing:** **bcrypt** (`bcryptjs`, 10 rounds) in the Mongoose `pre("save")` hook. Legacy HMAC-SHA256 accounts are detected by hash prefix and upgraded to bcrypt transparently on next login.
- **OTP hashing:** OTP codes are bcrypt-hashed at rest and verified with `bcrypt.compare`; re-requests upsert (one record per email) and reset the 15-min TTL.
- **JWT:** signed with `process.env.SECRET`, stored in an **httpOnly cookie** `token` (24h). `createToken` returns `null` if the user isn't verified.
- **Middleware:** `checkIsAuthentic` runs on every route; it sets `req.user` from the cookie (no hard block — individual controllers return 401 when `req.user?.id` is missing).
- ⚠️ **Cookie flags are dev defaults** (`secure: false`, `sameSite: "Lax"`). Comments note these must become `secure: true` / `sameSite: "None"` for cross-site production deployment.
- ⚠️ **CORS** in `index.js` is hardcoded to `http://localhost:5173` — must be updated for production origin.

---

## Environment Variables

### Backend (`attendanceTrackerBakeEnd/.env`)
Templates live in `.env.example`. The `.env` is pre-created — fields marked **FILL_ME** need your values; `SECRET` is already generated.
| Var | Used by | Purpose | Status |
|-----|---------|---------|--------|
| `MONGODB_URL` | connection.js / handler.js / serverless.yml | MongoDB Atlas connection string | **FILL_ME** |
| `SECRET` | service/authentication.js | JWT signing secret | pre-generated ✓ |
| `MAIL_USER` | service/mailSender.js | Gmail address for OTP email | **FILL_ME** |
| `MAIL_PASS` | service/mailSender.js | Gmail **app password** (not your login password) | **FILL_ME** |
| `PORT` | test.js | Local dev port | set to 8000 ✓ |

### Frontend (`attendance_portal_fontend/.env`)
Template in `.env.example`; `.env` is pre-created with the local default.
| Var | Purpose | Status |
|-----|---------|--------|
| `VITE_SERVER_URL` | API base URL (`http://localhost:8000` locally; deployed API URL in prod) | set ✓ |

---

## Running Locally

### Backend
```bash
cd attendanceTrackerBakeEnd
npm install
cp .env.example .env     # then fill MONGODB_URL, MAIL_USER, MAIL_PASS (SECRET is pre-set)
npm run dev              # nodemon test.js → connects to Mongo, then Express on $PORT (8000)
# or: serverless offline → http://localhost:8000  (serverless.yml httpPort 8000)
```
> `test.js` now connects to MongoDB **before** listening (Lambda still connects via `handler.js`).
> `index.js` CORS expects the frontend at `http://localhost:5173`.

### Frontend
```bash
cd attendance_portal_fontend
npm install              # `.npmrc` sets legacy-peer-deps=true so this just works
cp .env.example .env     # VITE_SERVER_URL defaults to http://localhost:8000
npm run dev              # Vite → http://localhost:5173
```

### Database Migration
After the DB refactor (date→string, ids→ObjectId), bring existing `attendance` rows up to the new schema:
```bash
cd attendanceTrackerBakeEnd
npm run migrate:attendance -- --dry-run   # preview changes, write nothing
npm run migrate:attendance                # convert old rows in place
npm run migrate:attendance -- --drop      # OR wipe the collection for a clean slate
```
The script (`scripts/migrateAttendance.js`) uses `MONGODB_URL` from `.env`. Conversions that would collide with the unique `{userId,date,slotId}` index are reported and skipped. Password/OTP hashing needs **no** migration — legacy password accounts upgrade to bcrypt automatically on next login.

### Seed Demo Data
Populate the demo user (`aluribalakalki5@gmail.com`) with a realistic 2nd-year CSE timetable (50-min periods, Mon–Sat, labs as 2-period blocks) and ~6 weeks of attendance history with varied per-subject percentages:
```bash
cd attendanceTrackerBakeEnd
npm run seed
```
`scripts/seedData.js` is **idempotent** — it wipes that user's timetable/slots/subjects/attendance and reseeds (it never touches the account/password). Edit the `CONFIG`, `SUBJECTS`, and `WEEK` constants at the top to change the dataset.

---

## Deployment

- **Backend → AWS Lambda** via Serverless Framework v4 (`serverless.yml`): service `attendance-portal`, runtime `nodejs20.x`, region `ap-south-1`, single `app` function proxying `/{proxy+}` for any method. A `Dockerfile` (AWS Lambda Node 22 base) is also present as an alternative image-based deploy.
- **Frontend → Vercel** (`vercel.json`): builds with `npm run build` → `dist`, installs with `--legacy-peer-deps --include=dev`, SPA rewrite of all paths to `/`. `predeploy`/`deploy` scripts also exist for `gh-pages`.

---

## Known Quirks / Tech Debt

- Directory name `attendance_portal_fontend` is misspelled ("fontend"); repo root folder is `Attandance Tracker` (misspelled too).
- `handleConfigTimeTable` does `deleteOne` then immediately checks for an existing doc (the conflict check is effectively dead since it just deleted it).
- A few user-facing strings/typos: `req.status` (should be `res.status`) in `handleCreateUser`/`handleChangePassword` validation branches; "Total Calsses" label on the dashboard.
- `connection.js` still passes deprecated `useNewUrlParser`/`useUnifiedTopology` options (no-ops in Mongoose 8).
- **Migration note:** the DB refactor changed `attendance.date` from `Date` → `"YYYY-MM-DD"` string and `slotId`/`subjectId` from `String` → `ObjectId`. Rows written before the refactor have the old types — run `npm run migrate:attendance` (converts in place; `--dry-run` to preview, `--drop` to wipe) before relying on per-day upserts. See [Database Migration](#database-migration).
- Planned-but-unimplemented API: `/api/bunks/:userId` bunk calculator, `PUT /api/attendance`.
- `pages/Home.jsx`, `components/layouts/Sidenav.jsx`, and `components/timetable/AddTimetable.jsx` appear to be unused/placeholder.
- No automated tests; `test.js` is the local server entrypoint, not a test suite.
```
