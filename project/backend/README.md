# WizJobAI Backend

The backend API for **WizJobAI** — a job discovery and application platform with an integrated AI assistant ("Wizbot"). Built with **Node.js**, **Express**, and **MongoDB (Mongoose)**, using plain **CommonJS JavaScript** (no build step required).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Installation & Running](#installation--running)
- [API Endpoints](#api-endpoints)
- [Performance Notes](#performance-notes)
- [Testing](#testing)
- [Changelog / What Changed](#changelog--what-changed)

---

## Overview

WizJobAI's backend provides:

- **Authentication** — registration, login, JWT sessions, email OTP verification, password reset, role-based access (`jobseeker` / `recruiter` / `admin`).
- **User profiles** — profile updates, avatar upload/removal via Cloudinary.
- **Jobs** — public, paginated, searchable job listings, plus recruiter/admin job CRUD.
- **Applications** — apply to jobs with an optional resume upload, track application status; recruiters manage applicants for the jobs they own.
- **Wizbot (AI Assistant)** — persistent chat sessions and message history per user.
- **Dashboard Analytics** — aggregated, high-performance metrics for the user dashboard.

---

## Tech Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Runtime        | Node.js (>=18), plain CommonJS JavaScript     |
| Framework      | Express 4                                     |
| Database       | MongoDB via Mongoose 8                        |
| File storage   | Cloudinary (images + resumes)                 |
| Auth           | JSON Web Tokens (JWT), bcrypt password hashing|
| Validation     | Zod                                           |
| Testing        | Jest + Supertest + mongodb-memory-server      |
| Security       | Helmet, express-mongo-sanitize, CORS, rate limiting |
| Performance    | compression (gzip), Mongoose indexes, `.lean()`/`.select()`, pagination |

---

## Folder Structure

```
backend/
├── server.js                     # Entry point — run with `node server.js`
├── package.json
├── jest.config.js
├── .env.example
├── src/
│   ├── app.js                    # Express app: middleware + route registration
│   ├── config/
│   │   ├── env.js                # Centralized environment variable loading
│   │   ├── db.js                 # MongoDB connection (with pooling)
│   │   └── cloudinary.js         # Cloudinary SDK configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── chatController.js     # Wizbot
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT `protect` + `restrictToVerified` + `restrictTo(...roles)`
│   │   ├── errorHandler.js       # Centralized error handling
│   │   ├── rateLimiters.js
│   │   ├── upload.js             # Multer: avatar images + resume documents
│   │   └── validate.js           # Zod request validation
│   ├── models/
│   │   ├── User.js               # includes `role`: jobseeker | recruiter | admin (default jobseeker)
│   │   ├── Job.js                # includes `postedBy` (ObjectId ref User, required, indexed)
│   │   ├── Application.js
│   │   └── ChatSession.js        # Wizbot persistence
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js          # public reads + recruiter/admin-restricted create/update/delete
│   │   ├── applicationRoutes.js
│   │   ├── chatRoutes.js
│   │   └── analyticsRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   └── cloudinaryService.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── jobValidators.js      # createJob / updateJob payload validation
│   │   └── miscValidators.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── apiResponse.js
│   │   ├── catchAsync.js
│   │   └── token.js
│   └── tests/
│       ├── setup.js
│       ├── api.test.js
│       ├── auth.test.js
│       ├── user.test.js
│       ├── job.test.js           # listing + recruiter CRUD/ownership + role assignment
│       ├── application.test.js   # apply flow + job-owner/admin management + ownership restrictions
│       ├── chat.test.js
│       └── analytics.test.js
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
# Server
PORT=5003
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_uri
MONGO_URI_TEST=your_mongodb_test_uri

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Client
CLIENT_URL=http://localhost:3002

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OTP
OTP_EXPIRES_IN_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate limiting
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=10
```

> `JWT_SECRET` and `MONGO_URI` have safe local-dev fallbacks, but **must** be set explicitly in any deployed environment.

---

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env with your real MongoDB URI, JWT secret, and Cloudinary credentials

# 3. Run the server
node server.js
# or, for auto-reload during development:
npm run dev
```

The API will be available at `http://localhost:5003` (or your configured `PORT`), with a health check at:

```
GET /api/health
```

---

## API Endpoints

All responses follow a consistent shape:

```json
{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }
```

or, on error:

```json
{ "success": false, "message": "...", "code": "ERROR_CODE", "details": [...] }
```

### Auth — `/api/auth`

| Method | Endpoint                    | Auth | Description                              |
|--------|------------------------------|------|-------------------------------------------|
| POST   | `/register`                  | —    | Create an account. Optional `role`: `jobseeker` (default) or `recruiter`. Self-registering as `admin` is rejected. |
| POST   | `/login`                     | —    | Log in, returns JWT + sets cookie         |
| POST   | `/logout`                    | —    | Clears the auth cookie                    |
| GET    | `/me`                        | ✅   | Get the current user                      |
| POST   | `/otp/send`                  | —    | Send an email-verification OTP            |
| POST   | `/otp/verify-email`          | —    | Verify email using the OTP                |
| POST   | `/forgot-password`           | —    | Request a password-reset OTP              |
| POST   | `/verify-reset-otp`          | —    | Verify reset OTP, returns a reset token   |
| POST   | `/reset-password`            | —    | Reset password using the reset token      |
| PATCH  | `/update-password`           | ✅   | Change password while logged in           |

### Users — `/api/users`

| Method | Endpoint          | Auth | Description                     |
|--------|-------------------|------|----------------------------------|
| PATCH  | `/me`              | ✅   | Update profile fields            |
| POST   | `/me/avatar`       | ✅   | Upload profile picture (Cloudinary) |
| DELETE | `/me/avatar`       | ✅   | Remove profile picture           |

### Jobs — `/api/jobs`

| Method | Endpoint       | Auth | Description                                                      |
|--------|----------------|------|---------------------------------------------------------------- |
| GET    | `/`             | —    | List jobs. Query: `search`, `workMode`, `employmentType`, `page`, `limit` |
| GET    | `/saved/me`     | ✅   | List the logged-in user's saved/bookmarked jobs (paginated)      |
| GET    | `/:id`          | —    | Get a single job                                                  |
| POST   | `/:id/save`     | ✅   | Bookmark a job (idempotent)                                       |
| DELETE | `/:id/save`     | ✅   | Remove a job from saved jobs                                      |
| POST   | `/:id/report`   | ✅   | Report a job listing. Body: `reason` (`not_accepting_applications`\|`spam`\|`fraud_or_scam`\|`misleading_description`\|`other`), `description` |
| POST   | `/`             | ✅ recruiter/admin | Create a job posting, owned by the creating user |
| PATCH  | `/:id`          | ✅ recruiter/admin | Update a job posting. Recruiters may only update jobs they posted; admins may update any |
| DELETE | `/:id`          | ✅ recruiter/admin | Delete a job posting. Same ownership rule as update |

### Applications — `/api/applications`

| Method | Endpoint          | Auth | Description                                              |
|--------|-------------------|------|------------------------------------------------------------|
| POST   | `/:jobId`          | ✅   | Apply to a job (multipart field `resume`, optional `coverLetter`) |
| GET    | `/me`              | ✅   | List the logged-in user's applications (paginated)        |
| GET    | `/job/:jobId`      | ✅ job owner/admin | List all applications submitted for a job (paginated). Restricted to the recruiter who posted the job, or an admin |
| PATCH  | `/:id/status`      | ✅ job owner/admin | Update an application's status (`applied`/`interview`/`offer`/`rejected`). Same ownership rule |

### Wizbot Chat — `/api/chat`

| Method | Endpoint                       | Auth | Description                             |
|--------|--------------------------------|------|-------------------------------------------|
| POST   | `/sessions`                     | ✅   | Create a new chat session                |
| GET    | `/sessions`                     | ✅   | List sessions (with last-message preview) |
| GET    | `/sessions/:sessionId`           | ✅   | Get a session with full message history   |
| POST   | `/sessions/:sessionId/messages`  | ✅   | Append a message to a session             |
| DELETE | `/sessions/:sessionId`           | ✅   | Delete a session                          |

### Wizbot Auto-Apply Bots — `/api/bots`

The "Manage Wizbot" feature — automated bots that scan and apply to jobs on a
user's behalf, distinct from the conversational Wizbot Chat above.

| Method | Endpoint            | Auth | Description                                                        |
|--------|---------------------|------|---------------------------------------------------------------------|
| POST   | `/`                  | ✅   | Create a bot: `name`, `avatar` (one of the fixed avatar set), `config` (`jobTitle`, `jobType`, `workMode`, `minSalary`, `maxSalary`, `excludedCompanies`) |
| GET    | `/`                  | ✅   | List the logged-in user's bots with summary stats                  |
| GET    | `/:id`               | ✅   | Bot detail: config, stats, recent activity log, and a conversion funnel (applied/interview/offer/rejected) derived from real Applications |
| PATCH  | `/:id`               | ✅   | Edit a bot's name, avatar, or config                                |
| PATCH  | `/:id/pause`         | ✅   | Pause a bot                                                         |
| PATCH  | `/:id/resume`        | ✅   | Resume a paused bot                                                 |
| DELETE | `/:id`               | ✅   | Delete a bot                                                        |
| POST   | `/:id/activity`      | ✅   | Record an activity-log row (`scanned`/`applied`/`skipped`/`error`); increments the bot's counters, and — when `applied` includes a real `jobId` — files a linked Application so outcomes (interviews/offers) roll up into the bot's conversion funnel |

### Analytics — `/api/analytics`

| Method | Endpoint     | Auth | Description                                       |
|--------|--------------|------|----------------------------------------------------|
| GET    | `/dashboard`  | ✅   | Aggregated dashboard metrics for the logged-in user, including application status breakdown, success rate, and a bot summary (`total`, `active`, `jobsScanned`, `applied`) |

---

## Performance Notes

- **Indexes:** `User.email` (unique), `Job` text index on `title`/`company`/`skills` plus indexes on `postedAt`, `employmentType`, `workMode`; `Application` compound indexes on `(user, job)` (unique), `(job, status)`, `(user, createdAt)`; `ChatSession` index on `(user, updatedAt)`.
- **Lean queries:** list/detail endpoints that don't need to save the document back (`Job`, `Application`, `ChatSession` reads) use `.lean()` to skip Mongoose document hydration.
- **Field projection:** `.select()` is used to fetch only the fields each view actually needs (e.g. job listings omit the full `description`/`requirements`).
- **Pagination:** all list endpoints (`jobs`, `applications`, `chat sessions`) support `page`/`limit` query params, capped at 50 per page.
- **Compression:** gzip/deflate response compression is enabled globally via the `compression` middleware.
- **Caching headers:** public, read-mostly job endpoints send `Cache-Control` headers so clients/CDNs can cache briefly.
- **Connection pooling:** the MongoDB connection is configured with a bounded pool (`maxPoolSize: 10`) to keep concurrent request latency low.
- **Atomic updates:** Wizbot message appends use `findOneAndUpdate` with `$push` (a single round-trip) instead of fetch-mutate-save.
- **Aggregation:** dashboard metrics use a single MongoDB aggregation pipeline for the status breakdown instead of four sequential `countDocuments` calls.

---

## Testing

Tests use **Jest**, **Supertest**, and an in-memory MongoDB instance via **mongodb-memory-server** (Cloudinary and email calls are mocked).

```bash
npm test          # run once
npm run test:watch  # watch mode
```

> **Note:** `mongodb-memory-server` downloads a MongoDB binary the first time it runs. Make sure the environment running the tests has outbound internet access (or a pre-cached binary) — this is unrelated to the application code itself.

Test coverage includes: registration/login (including role assignment), JWT-protected routes, OTP + password-reset flow, profile updates, avatar upload/delete, job listing/filtering/pagination, recruiter job CRUD and ownership enforcement, job applications (apply, duplicate prevention, status updates, job-owner/admin access restrictions), Wizbot chat sessions, and dashboard analytics.

---

## Changelog / What Changed

This project was migrated from TypeScript to plain CommonJS JavaScript, with the following fixes and additions:

**Bug fixes**
- `auth.js` middleware: the password-change invalidation check was a dead no-op that never actually ran (it computed a value but never acted on it, and used the wrong timestamp). Fixed to properly reject tokens issued before a password change.
- `User` model's password-hashing `pre('save')` hook lacked a `try/catch` around the async bcrypt call, which could result in an unhandled promise rejection. Fixed.
- Removed a redundant single-field index on `Application.user` that duplicated coverage already provided by the compound indexes.

**New modules**
- Applications module: controller, routes, resume-upload support, duplicate-prevention, status updates.
- Wizbot module: `ChatSession` model, controller, routes for session + message persistence.
- Analytics module: single-aggregation dashboard metrics endpoint.

**Performance**
- Added `compression` middleware, additional Mongoose indexes, `.lean()`/`.select()` on read paths, consistent pagination, and Cache-Control headers on public job routes.

**Role-based access control**
- Added a `role` field to `User` (`jobseeker` | `recruiter` | `admin`, default `jobseeker`). Self-registration can opt into `recruiter`; `admin` cannot be self-assigned and must be granted directly (e.g. by an existing admin/operator).
- Added `postedBy` (required, indexed `ObjectId` ref to `User`) to `Job`, so every job posting has a clear owner.
- Added a `restrictTo(...roles)` middleware for role gating, used alongside the existing `protect` middleware.
- Added recruiter/admin-only job CRUD (`POST /api/jobs`, `PATCH /api/jobs/:id`, `DELETE /api/jobs/:id`), with `PATCH`/`DELETE` additionally enforcing that the requester either owns the job (`postedBy`) or is an admin. Public `GET` endpoints are unchanged.
- Locked down `GET /api/applications/job/:jobId` and `PATCH /api/applications/:id/status` to the recruiter who owns the underlying job, or an admin; job seeker-facing routes (`applyToJob`, `getUserApplications`) are unchanged.
