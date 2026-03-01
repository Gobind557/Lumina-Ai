# Sales Copilot – Combined Documentation

Single reference combining all project docs. No crucial points removed.

**Current state:** This doc has been aligned with the codebase: backend scripts (`npm run dev`, `npm run dev:all`, `worker:email`, `consumer:analytics`, `consumer:campaign`), health at `GET /health` (root), env (including `APP_URL`, `GROQ_MODEL` default), Prisma schema (enums, Template.content), API routes (all under `/api`, webhooks at `/api/webhooks/email/...`), and elevator pitch / cons updated to reflect React Query on dashboard and campaign consumers.

---

## Table of Contents

1. [Overview & Features](#1-overview--features)
2. [Getting Started & Setup](#2-getting-started--setup)
3. [Project Structure](#3-project-structure)
4. [Architecture Rating, Pros/Cons & Tech](#4-architecture-rating-proscons--tech)
5. [Data Flow & Schema by Page](#5-data-flow--schema-by-page)
6. [Design Principles (Lumina)](#6-design-principles-lumina)
7. [End-to-End Flows](#7-end-to-end-flows)
8. [API Endpoints (Full List)](#8-api-endpoints-full-list)
9. [Event-Driven Flows (Webhooks → Consumers)](#9-event-driven-flows-webhooks--consumers)
10. [Database Schema (All Tables)](#10-database-schema-all-tables)
11. [Dashboard (Real-Time & Implementation)](#11-dashboard-real-time--implementation)
12. [Campaigns Lifecycle & Events](#12-campaigns-lifecycle--events)
13. [Frontend Architecture](#13-frontend-architecture)
14. [MVP Architecture Summary](#14-mvp-architecture-summary)
15. [System Design (Requirements & Phases)](#15-system-design-requirements--phases)
16. [Architecture Diagrams](#16-architecture-diagrams)
17. [Technology Stack (Detailed)](#17-technology-stack-detailed)
18. [Error Handling & API Patterns](#18-error-handling--api-patterns)
19. [Quick Reference: Where Things Live](#19-quick-reference-where-things-live)
20. [Data Flow One-Page Diagram](#20-data-flow-one-page-diagram-from-data_flow_and_schema)
21. [Lumina End-to-End Flow Steps](#21-lumina-end-to-end-flow-steps-from-lumina_flow)
22. [System Design Phases & Error Categories](#22-system-design-phases--error-categories-from-system_design)
23. [Frontend Constants & API Client](#23-frontend-constants--api-client-current)

---

## 1. Overview & Features

**Sales Copilot** is a full-stack AI-powered sales email app: compose, personalize, send, and track. React SPA + Express API, background workers for delivery, event-driven analytics. Auth: email/password + OAuth (Google, LinkedIn). AI: OpenAI-compatible API (e.g. Groq).

| Area | Capabilities |
|------|--------------|
| **Email** | Rich composer, draft auto-save, idempotent send, open tracking via webhooks |
| **AI** | Personalize, rewrite, score emails; configurable tone and prospect context |
| **Templates** | CRUD, categories, favorites, usage metrics |
| **Prospects** | Store and manage for personalization |
| **Campaigns** | Create, list, detail, status (DRAFT/ACTIVE/PAUSED/COMPLETED/ARCHIVED) |
| **Dashboard** | Stats, timeline, momentum, campaign summaries |
| **Auth** | Signup/login, Google & LinkedIn OAuth, JWT for API |

**Tech stack (summary):** Frontend: React 18, TypeScript, Vite, React Router v6, Tailwind, Recharts, Lucide. Backend: Node.js, Express, TypeScript, Zod. DB: PostgreSQL, Prisma. Queue/events: Redis, BullMQ, Redis pub/sub. Auth: JWT, Passport (Google/LinkedIn), bcryptjs. Email: Nodemailer. AI: OpenAI SDK (Groq-compatible).

---

## 2. Getting Started & Setup

### Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL 15+
- Redis 7+
- npm or pnpm

### Backend

```bash
cd backend/api
cp .env.example .env
# Set DATABASE_URL, REDIS_URL, JWT_SECRET, OAuth keys, SMTP, GROQ_*, CORS_ORIGIN
npm install
```

### Database

```bash
cd backend/database
npm install
npx prisma migrate dev
# Optional: npx prisma db seed
```

### Run API

```bash
cd backend/api
npm run dev
```

API: `http://localhost:4000` (or `PORT` from env). **Health check:** `GET /health` (on app root, not under `/api`) → `{ "status": "ok" }`.

### Run API + worker + all consumers (single process, local dev)

```bash
cd backend/api
npm run dev:all
```

Starts: Express server + email worker (BullMQ) + analytics consumer + campaign consumer (Redis subscribe). Use for local development when you want everything in one terminal.

### Run workers/consumers separately (optional)

```bash
cd backend/api
npm run worker:email          # BullMQ email send worker
npm run consumer:analytics    # Redis: EMAIL_OPENED, EMAIL_REPLIED → EmailOpenEvent, EmailReplyEvent
npm run consumer:campaign     # Redis: EMAIL_QUEUED, EMAIL_SENT, EMAIL_REPLIED → Campaign/CampaignProspect updates
```

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

Frontend: `http://localhost:5173` (or port Vite prints).

### Environment Variables (Critical)

**Frontend:** `VITE_API_URL` — API base URL. Frontend builds URLs as `${API_BASE}/dashboard/stats`, etc. So set to full base including `/api` when using a different origin (e.g. `http://localhost:4000/api`). If unset, code uses `'/api'` (relative, same-origin).

**Backend** (from `backend/api/src/config/env.ts`; Zod-validated at startup):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | |
| `PORT` | No | `4000` | API port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Min 10 chars |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry |
| `REDIS_URL` | Yes | — | Redis (queue + pub/sub) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Yes | — | Google OAuth |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_CALLBACK_URL` | Yes | — | LinkedIn OAuth |
| `GROQ_API_KEY` | Yes | — | AI (OpenAI-compatible) |
| `GROQ_MODEL` | No | `llama-3.1-8b-instant` | Model name |
| `GROQ_BASE_URL` | No | `https://api.groq.com/openai/v1` | AI API base |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | Yes | 587, false | Email send |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin |
| `APP_URL` | No | `http://localhost:4000` | App base URL (e.g. for OAuth redirects) |

See `backend/api/.env.example` for full list.

---

## 3. Project Structure

**Actual repo layout:**

```
Sales Copilot/
├── frontend/
│   ├── src/
│   │   ├── core/             # Router, providers (Query, Auth)
│   │   ├── features/         # auth, campaigns, dashboard, email, prospects, templates
│   │   │   └── <feature>/    # pages, components, hooks, api, types
│   │   ├── shared/           # api client, layout, constants, types, utils
│   │   ├── App.tsx, main.tsx
│   └── vite.config.ts
├── backend/
│   ├── api/src/
│   │   ├── app/              # Express app, routes, server
│   │   ├── config/           # Env (Zod-validated)
│   │   ├── infrastructure/   # Prisma, Redis queue, event bus, SMTP, logger
│   │   ├── modules/          # auth, email (incl. webhook.controller), ai, prospect, template, analytics, campaign, dashboard
│   │   │   └── <module>/     # routes, controller, service, repository; email has email.worker; analytics/campaign have *.consumer
│   │   └── shared/           # middleware, errors, types
│   └── database/prisma/      # schema.prisma, migrations
└── docs/
```

**Scripts (current):**

| Where | Command | Description |
|-------|---------|-------------|
| Frontend | `npm run dev` | Vite dev server (HMR) |
| Frontend | `npm run build` | `tsc && vite build` |
| Frontend | `npm run preview` | Preview production build |
| Frontend | `npm run lint` | ESLint |
| Backend | `npm run dev` | API only (ts-node-dev) |
| Backend | `npm run dev:all` | API + email worker + analytics consumer + campaign consumer (one process) |
| Backend | `npm run build` | Compile to `dist/` |
| Backend | `npm start` | Run `node dist/index.js` |
| Backend | `npm run worker:email` | Email send worker only |
| Backend | `npm run consumer:analytics` | Analytics event consumer only |
| Backend | `npm run consumer:campaign` | Campaign event consumer only |
| Backend | `npm test` | Jest |
| Backend | `npm run lint` | ESLint |

---

## 4. Architecture Rating, Pros/Cons & Tech

### Ratings

| Area | Rating | Notes |
|------|--------|--------|
| Backend structure | 8/10 | Module-based, shared infra, clear layers |
| Frontend structure | 8/10 | Core/features/shared, feature folders with api/hooks/types |
| Data & persistence | 8/10 | Prisma + PostgreSQL, typed schema, migrations |
| Async & events | 8/10 | BullMQ + Redis queue, Redis pub/sub, workers/consumers |
| Auth & security | 7/10 | JWT, Passport OAuth; no refresh flow yet |
| API design | 7/10 | REST, auth/error middleware, request IDs |
| AI integration | 7/10 | OpenAI-compatible (Groq); no streaming yet |
| Testing & DX | 6/10 | Jest + Supertest on API; frontend/E2E not covered |
| Config & env | 8/10 | Zod-validated env, single source of truth |

### Pros

- Modular backend: each domain has routes → controller → service → repository.
- Feature-based frontend: core (router, providers), features (pages, components, hooks, api, types), shared (api, layout, utils).
- Async email pipeline: API creates record → queue → worker sends → event published; retries and observability.
- Domain events: Redis pub/sub for EMAIL_QUEUED, EMAIL_SENT, EMAIL_OPENED, EMAIL_REPLIED; analytics/campaign consumers react without coupling.
- Type safety: TypeScript end-to-end, Prisma types, Zod for env/validation.
- Structured errors: ApiError + global error middleware; request IDs.
- OAuth + JWT: Passport Google/LinkedIn; JWT for API.
- Validated config: Zod at startup; misconfiguration fails fast.

### Cons

- React Query is used for dashboard (stats, timeline, momentum, campaigns) with polling; other features may still use ad hoc fetch.
- JWT only in memory/localStorage — no refresh tokens or secure cookie.
- Limited tests — backend API tests; frontend and E2E missing.
- AI not streaming — request/response only.
- Templates: backend full CRUD; frontend may still have some localStorage/mock fallback in places; one source of truth clearer.
- No API versioning — no `/api/v1` prefix yet.
- Monolith — API, workers, consumers in one repo.

### Alternatives to Consider

| Current | Alternative | When |
|---------|-------------|------|
| REST + JWT | Session cookies + CSRF | Server-side sessions |
| REST only | tRPC or GraphQL | Strong typing or flexible querying |
| BullMQ + Redis | SQS + Lambda, Inngest | Managed queue or event-driven |
| Prisma | Drizzle, Kysely | Lighter ORM or more SQL control |
| Express | Fastify, Hono | Perf or footprint |
| Vite + React SPA | Next.js | SEO, auth middleware, RSC |
| Feature folders | Nx/Turborepo | Multiple apps/packages |
| Zod backend only | Zod on frontend forms | Shared validation |

### Elevator pitch (current state)

*Full-stack TypeScript sales copilot. Frontend: React SPA with core/features/shared; each feature has pages, components, hooks, API layer; shared has API client (apiRequest + Bearer token), layout, constants. Dashboard uses React Query for stats, timeline, momentum, and campaigns with refetch intervals (15–30s). Backend: Express, module-based (auth, email with webhooks, AI, prospects, templates, campaigns, dashboard); Prisma + PostgreSQL; Zod-validated env; JWT and Passport (Google/LinkedIn). Email sending is async: API creates Email row and enqueues BullMQ job; worker sends via SMTP and publishes EMAIL_SENT on Redis; analytics consumer writes EmailOpenEvent/EmailReplyEvent; campaign consumer updates CampaignProspect (REPLIED) and campaign status (DRAFT→ACTIVE, completion). AI uses Groq (OpenAI-compatible) for personalize/rewrite/score. Health: GET /health at app root. Local dev: npm run dev:all runs API + worker + both consumers in one process. Built for clarity and testability; room for refresh tokens and API versioning.*

---

## 5. Data Flow & Schema by Page

All API requests (except auth) send `Authorization: Bearer <token>` (JWT from `localStorage.auth_token`). Base URL: `VITE_API_URL` or `/api`.

### Frontend routes (pages)

| Route | Page | Auth |
|-------|------|------|
| `/` | Dashboard | Required |
| `/compose` | EmailComposer | Required |
| `/campaigns` | Campaigns | Required |
| `/campaigns/new` | CreateCampaign | Required |
| `/campaigns/:id` | CampaignDetail | Required |
| `/prospects` | Prospects | Required |
| `/templates` | Templates | Required |
| `/templates/new` | CreateTemplate | Required |
| `/templates/:id` | EditTemplate | Required |
| `/login` | Login | Public only |
| `/signup` | Signup | Public only |
| `/auth/callback` | AuthCallback | Public |

### Page → API → Backend → Tables (summary)

- **Dashboard (`/`)**: `getStats`, `getTimeline(days)`, `getMomentum`, `getCampaigns` → dashboard.controller/service → User (implicit), Email, EmailOpenEvent, EmailReplyEvent, Campaign, Prospect (via Email).
- **Compose (`/compose`)**: prospect lookup/create, save draft, send email, get email status, AI personalize/rewrite/score → prospect + email + ai controllers → Prospect, EmailDraft, Email (create then read). Send creates Email row, enqueues job; worker sends, publishes EMAIL_SENT.
- **Campaigns list**: `GET /api/campaigns?status=&limit=&offset=` → campaign.service `listCampaigns` → Campaign + _count Email.
- **Create Campaign**: list prospects, POST campaigns (name, description, startDate, endDate, workspaceId, prospectIds[], optional status) → Campaign + CampaignProspect.
- **Campaign detail**: get campaign with metrics, update status, get campaign prospects → Campaign, Email, EmailOpenEvent, EmailReplyEvent, CampaignProspect, Prospect.
- **Prospects**: list (search, limit, offset), create; also GET/PATCH/DELETE by id → Prospect.
- **Templates**: list (limit 200), create, get one, update, delete → Template.
- **Auth**: signup, login, Google/LinkedIn OAuth and callbacks → User, OAuthConnection.

---

## 6. Design Principles (Lumina)

- **Local-first editing:** Editor state in React; user never waits on backend to type. Draft persistence debounced, non-blocking. Idempotent writes.
- **AI as pure function:** AI never writes to DB or triggers side effects. Returns suggestions only. Idempotent and cacheable.
- **Human-in-the-loop:** Suggestions optional; user must accept. Manual edits invalidate stale suggestions. Glow System for visual feedback.
- **Deterministic send flow:** Send intent persisted before side effects. Idempotency keys prevent duplicates. Worker failures don’t lose intent. Email record immutable after creation.
- **Event-driven analytics:** Events append-only; analytics eventually consistent. Failures don’t affect core. Learning systems consume events async.

### Glow System states

Idle → Thinking → Suggestion Ready → Stale → Applied. Visual: intensity = confidence; color = freshness (green/yellow/blue); pulse when Thinking.

---

## 7. End-to-End Flows

- **Composer load:** GET draft → editor init from draft; no AI.
- **Draft loop:** User types → local state → debounced POST /emails/draft (idempotent).
- **AI:** POST /ai/personalize, /rewrite, /score → no DB writes; Glow: Thinking → Suggestion Ready.
- **Accept suggestion:** Apply locally → POST /emails/draft; optional POST /ai/feedback async.
- **Send:** Frontend generates idempotency key → POST /emails/send (Idempotency-Key header) → backend creates Email row (PENDING_SEND), enqueues job → returns success.
- **Worker:** Picks job → SMTP send → UPDATE Email (SENT, sentAt, providerMessageId) → publish EMAIL_SENT.
- **Webhooks:** Open pixel or POST /webhooks/email/open, POST /webhooks/email/reply → publish EMAIL_OPENED / EMAIL_REPLIED → analytics consumer writes EmailOpenEvent / EmailReplyEvent; campaign consumer updates CampaignProspect.status to REPLIED on reply.

**Performance targets:** Typing &lt;16ms; draft save &lt;100ms; AI &lt;3s p95; send confirmation &lt;200ms. Draft persistence 99.9%; send 99.5%; event processing 99.9% eventual consistency.

---

## 8. API Endpoints (Full List)

All routes are mounted under `/api` in `app.use("/api", routes)`. So full paths are `/api/auth/...`, `/api/emails/...`, `/api/webhooks/...`, etc. Health is **not** under /api: `GET /health` → `{ "status": "ok" }`.

| Method | Full path | Auth | Controller / Tables touched |
|--------|-----------|------|-----------------------------|
| POST | /api/auth/signup | No | auth.signup → User |
| POST | /api/auth/login | No | auth.login → User |
| GET | /api/auth/google | No | passport redirect |
| GET | /api/auth/google/callback | No | oauth.oauthCallback → User, OAuthConnection |
| GET | /api/auth/linkedin | No | passport redirect |
| GET | /api/auth/linkedin/callback | No | oauth.oauthCallback → User, OAuthConnection |
| GET | /api/dashboard/stats | Yes | dashboard.getStats → Email, EmailOpenEvent, EmailReplyEvent, Campaign |
| GET | /api/dashboard/timeline | Yes | dashboard.getTimeline → Email, EmailOpenEvent, EmailReplyEvent, Prospect |
| GET | /api/dashboard/momentum | Yes | dashboard.getMomentum → EmailOpenEvent, EmailReplyEvent, Email, Prospect |
| GET | /api/dashboard/campaigns | Yes | dashboard.getCampaigns → Campaign, Email, events |
| GET | /api/emails/drafts/:id | Yes | email.getDraft → EmailDraft |
| POST | /api/emails/draft | Yes | email.upsertDraftHandler → EmailDraft |
| DELETE | /api/emails/draft/:id | Yes | email.deleteDraftHandler → EmailDraft |
| POST | /api/emails/send | Yes | email.sendEmail → Email, EmailDraft |
| GET | /api/emails/:id | Yes | email.getEmail → Email |
| GET | /api/prospects | Yes | prospect.list → Prospect |
| GET | /api/prospects/:id | Yes | prospect.getOne → Prospect |
| POST | /api/prospects | Yes | prospect.create → Prospect |
| PATCH | /api/prospects/:id | Yes | prospect.update → Prospect |
| DELETE | /api/prospects/:id | Yes | prospect.remove → Prospect |
| GET | /api/templates | Yes | template.list → Template |
| GET | /api/templates/:id | Yes | template.getOne → Template |
| POST | /api/templates | Yes | template.create → Template |
| PATCH | /api/templates/:id | Yes | template.update → Template |
| DELETE | /api/templates/:id | Yes | template.remove → Template |
| GET | /api/campaigns | Yes | campaign.list → Campaign |
| GET | /api/campaigns/:id | Yes | campaign.getById → Campaign, Email, events |
| GET | /api/campaigns/:id/prospects | Yes | campaign.getProspects → CampaignProspect, Prospect |
| POST | /api/campaigns | Yes | campaign.create → Campaign, CampaignProspect |
| PATCH | /api/campaigns/:id/status | Yes | campaign.updateStatus → Campaign |
| POST | /api/ai/personalize | Yes | ai.personalize → none |
| POST | /api/ai/rewrite | Yes | ai.rewrite → none |
| POST | /api/ai/score | Yes | ai.score → none |
| POST | /api/ai/feedback | Yes | ai.feedback → none |
| POST | /api/webhooks/email/open | No | webhook.emailOpenWebhook → publish only |
| GET | /api/webhooks/email/open-pixel | No | webhook.emailOpenPixel → publish only |
| POST | /api/webhooks/email/reply | No | webhook.emailReplyWebhook → publish only |

### Request/response schemas (key endpoints)

**Draft — POST /api/emails/draft**  
Body: `{ id?: string, prospectId?: string, subject?: string, bodyHtml?: string, bodyText?: string }`. Idempotent; debounced on frontend. Response: `{ id, updatedAt }`.

**Send — POST /api/emails/send**  
Body: `{ draftId, idempotencyKey, fromEmail, toEmail }`. Header: `Idempotency-Key: <uuid>`. Response: `{ id, status: "PENDING_SEND", createdAt }`. Email row created; job enqueued; worker sends and updates status to SENT/FAILED.

**AI personalize — POST /api/ai/personalize**  
Body: `{ draftId?, prospectId?, tone? }`. Response: `{ suggestion: { subject?, body?, diff? }, confidence, source_signals?, timestamp, input_hash? }`. Pure function; no DB writes.

**AI rewrite — POST /api/ai/rewrite**  
Body: `{ draftId?, instruction }`. Response: same shape as personalize.

**AI score — POST /api/ai/score**  
Body: `{ draftId? }`. Response: `{ spam_risk, reply_probability, signals? }`. Advisory only.

**Create campaign — POST /api/campaigns**  
Body: `{ name, description?, startDate?, endDate?, workspaceId?, prospectIds?: string[], status? }`. status can be DRAFT or ACTIVE. Creates Campaign and CampaignProspect rows for each prospectId.

**Error format:** `{ error: { code, message, details?, timestamp, request_id } }`. Codes: UNAUTHORIZED 401, FORBIDDEN 403, NOT_FOUND 404, VALIDATION_ERROR 400, IDEMPOTENCY_CONFLICT 409, RATE_LIMIT_EXCEEDED 429, INTERNAL_ERROR 500.

---

## 9. Event-Driven Flows (Webhooks → Consumers)

### Email send (Compose or campaign)

1. POST /api/emails/send → email.service createEmailSend → Email row PENDING_SEND, job enqueued (BullMQ).
2. Worker: SMTP send → Email SENT or FAILED → publish EMAIL_SENT (Redis channel `sales-copilot:events`).
3. Consumers: Campaign consumer can activate DRAFT campaign on first email; analytics consumer (template metrics).

### Open tracking

1. POST /webhooks/email/open or GET open-pixel?email_id= → webhook controller.
2. Read Email, publish EMAIL_OPENED.
3. Analytics consumer: recordEmailOpened → **EmailOpenEvent** (create).

### Reply tracking

1. POST /webhooks/email/reply (email_id, reply_subject, reply_body) → publish EMAIL_REPLIED.
2. Analytics: recordEmailReplied → **EmailReplyEvent**.
3. Campaign consumer: onEmailReplied → CampaignProspect updateMany status = REPLIED (by campaignId + prospectId from Email).

**Tables written by events:** EmailOpenEvent, EmailReplyEvent, CampaignProspect (status). UI: Dashboard and campaign metrics use these.

---

## 10. Database Schema (All Tables)

Source: `backend/database/prisma/schema.prisma`. Prisma client is generated to `backend/api/node_modules/.prisma/client` via `generator clientApi` in schema.

**Enums:** `UserRole` (admin, user). `EmailStatus` (PENDING_SEND, SENT, FAILED, BOUNCED). `CampaignStatus` (DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED). `CampaignProspectStatus` (ACTIVE, REPLIED).

**User & auth:** **User** — id (uuid), email (unique), passwordHash?, firstName?, lastName?, role (UserRole), createdAt, updatedAt. Relations: drafts, emails, oauth, templates, campaigns. **OAuthConnection** — id, userId, provider, emailAddress, accessToken, refreshToken?, tokenExpiresAt?, createdAt, updatedAt. Relation: user.

**Email lifecycle:** **EmailDraft** — id, userId, workspaceId?, prospectId?, subject?, bodyHtml?, bodyText?, createdAt, updatedAt. Relations: user, prospect?, emails. **Email** — id, draftId?, userId, workspaceId?, prospectId?, campaignId?, fromEmail, toEmail, subject, bodyHtml, bodyText, status (EmailStatus), idempotencyKey (unique), providerMessageId?, sentAt?, createdAt, updatedAt. Relations: user, draft?, prospect?, campaign?, openEvents, replyEvents. **EmailOpenEvent** — id, emailId, openedAt, createdAt. Relation: email (cascade delete). @@index([emailId]), @@index([openedAt]). **EmailReplyEvent** — id, emailId, repliedAt, replySubject?, replyBody?, createdAt. Relation: email (cascade delete). @@index([emailId]), @@index([repliedAt]).

**Prospects & campaigns:** **Prospect** — id, workspaceId?, email, firstName?, lastName?, company?, jobTitle?, customFields (Json default "{}"), createdAt, updatedAt. Relations: drafts, emails, campaignProspects. **Campaign** — id, userId, workspaceId?, name, description?, status (CampaignStatus default DRAFT), startDate?, endDate?, createdAt, updatedAt. Relations: user, emails, campaignProspects. @@index([userId]), @@index([status]), @@index([startDate]). **CampaignProspect** — id, campaignId, prospectId, status (CampaignProspectStatus default ACTIVE), currentStep (default 0), createdAt, updatedAt. @@unique([campaignId, prospectId]). Relations: campaign, prospect. @@index([campaignId]), @@index([prospectId]).

**Templates & company:** **Template** — id, userId, workspaceId?, title, description, **content** (not "body"), category, tone?, usedCount (default 0), openRate?, replyRate?, isFavorite (default false), createdAt, updatedAt. Relation: user. **CompanyData** — id, domain (unique), name?, industry?, size?, location?, metadata (Json default "{}"), createdAt, updatedAt. (Not referenced by current API flows; available for enrichment.)

---

## 11. Dashboard (Real-Time & Implementation)

### Implemented

- **Backend:** GET /api/dashboard/stats (emails, engagement, campaigns), /timeline (days, emails[], timeline[]), /momentum (opens[], replies[]), /campaigns (CampaignSummary[]).
- **Frontend hooks:** useDashboardStats (30s), useDashboardTimeline(days) (30s), useDashboardMomentum (15s), useDashboardCampaigns (30s). React Query with refetchInterval.
- **Example:** MomentumCard uses useDashboardMomentum(), loading, real data, 15s refresh.

### Component wiring

- **LiveConversationTimeline:** useDashboardTimeline(7); chart from timeline.timeline; recent emails from timeline.emails.
- **ActionCenter:** useDashboardStats(); readiness from engagement (e.g. openRate); reply likelihood from replyRate.
- **TopBanner:** useDashboardStats(); real metrics (emails sent today, opens, replies).
- **BestTimeCard / WhatToDoNextCard:** No backend yet; keep static until endpoints exist.

### Data flow

Dashboard → useDashboard* → dashboardApi → GET /api/dashboard/* → dashboard.service → Prisma (Email, EmailOpenEvent, EmailReplyEvent, Campaign). Future: WebSockets or SSE for live updates.

---

## 12. Campaigns Lifecycle & Events

1. **Created** → DRAFT (no emails sent).
2. **First email queued** → EMAIL_QUEUED → campaign consumer → DRAFT → ACTIVE (auto).
3. **Emails sent** → worker → EMAIL_SENT → campaign stays ACTIVE.
4. **End date reached** → consumer can set ACTIVE → COMPLETED (auto).
5. **Manual:** PAUSED, ARCHIVED via PATCH /api/campaigns/:id/status.

**Statuses:** DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED. Create campaign body: name, description, startDate, endDate, workspaceId, prospectIds[], optional status (e.g. ACTIVE for “Start Campaign”).

---

## 13. Frontend Architecture

**Feature-based:** `features/<feature>/` with components, hooks, pages, api, types; shared in `shared/`. Each feature can have services/, types/ later.

**Shared:** API client (apiRequest + auth + errors), layout (Header, Sidebar, Layout), constants (ROUTES, API_ENDPOINTS, etc.), types, utils. Path alias `@/` for src.

**Adding a feature:** Create features/new-feature/ (components, hooks, pages, index.ts); export pages/components; add route in App. Route protection: RequireAuth, PublicOnly.

---

## 14. MVP Architecture Summary

**Layers:** Frontend (Editor, Glow, Draft Manager, AI Panel) → REST API (draft, AI pure, send idempotent, events) → Workers (email send, event processor, analytics) → Data (PostgreSQL: email_drafts, emails, email_events, prospects, company_data; Redis queue/pub-sub).

**MVP out of scope:** Sequences, bulk campaigns, cohort analytics, CRM, team collaboration, mobile, billing, enterprise compliance, autonomous AI. Introduced in later phases.

---

## 15. System Design (Requirements & Phases)

**Phase 1 (MVP):** Auth, Gmail OAuth, composer, templates, AI generation, variable replacement, send via Gmail, draft, open tracking, basic analytics, preview.

**Phase 2 (Automation):** Sequences (up to 5 steps), delays, conditions, lead import, campaigns, reply detection, campaign dashboard.

**Phase 3–8:** Personalization (company lookup, news, tech stack), analytics (dashboard, A/B, export), teams (workspace, RBAC, shared templates), integrations (CRM, Calendly, Slack, Zapier), mobile/extension, enterprise (SSO, audit, warmup).

**Non-functional:** API &lt;500ms p95, page load &lt;2s, send &lt;5s; 10K+ users, 1M+ emails/month; 99.9% uptime; SOC 2, GDPR; encryption at rest/transit; rate limiting.

**Constraints:** Gmail/Microsoft Graph for email; OpenAI rate limits; cost-effective; GDPR, CAN-SPAM.

---

## 16. Architecture Diagrams

### One-page flow overview

```
FRONTEND: Dashboard / | Compose /compose | Campaigns /campaigns, /new, /:id | Prospects | Templates
    ↓
API: /api/dashboard/* | /api/emails, /api/prospects | /api/campaigns | /api/prospects | /api/templates
    ↓
BACKEND: Controllers → Services → Repositories (Prisma)
    ↓
TABLES: User, OAuthConnection | EmailDraft, Email, EmailOpenEvent, EmailReplyEvent | Prospect, Campaign, CampaignProspect | Template | CompanyData
    ↓
Webhooks (open, reply, open-pixel) → Publish EMAIL_OPENED / EMAIL_REPLIED
    ↓
EVENT CONSUMERS: Analytics → EmailOpenEvent, EmailReplyEvent; Campaign → CampaignProspect REPLIED, Campaign ACTIVE/COMPLETED
```

**System (high-level):** Client (Web, Extension, Mobile) → API Gateway → Application (Auth, Email, Campaign, AI, Analytics, Sequence, Integration, Team, Template) → Data (PostgreSQL, Redis, Elasticsearch, S3, Vector DB) → External (Gmail, Outlook, OpenAI, CRM) → Workers (Email, Sequence, Analytics, Webhook, Warmup).

**Email send:** User → Composer → POST /emails/send → Gateway → Email Service (validate, vars, tracking) → Queue → Email Worker (OAuth, refresh, send) → Gmail/Outlook → Update DB, track event.

**Security layers:** Network (WAF, DDoS, VPC) → Gateway (rate limit, validation) → App (JWT, OAuth, RBAC, input validation) → Data (encryption at rest/transit, secrets) → Monitoring (audit, SOC 2, GDPR).

---

## 17. Technology Stack (Detailed)

**Frontend:** React 18, TypeScript, Vite, React Router v6, Tailwind, Recharts, Lucide, clsx; path alias, provider composition (Router → QueryProvider → AuthProvider), RequireAuth/PublicOnly, apiRequest(), feature encapsulation.

**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, Passport, jsonwebtoken, bcryptjs, BullMQ, ioredis, Nodemailer, OpenAI SDK, Morgan. Layered modules (route → controller → service → repository); repository pattern; queue-based send; event-driven side effects (EMAIL_SENT etc.); ApiError + middleware; request ID; env validation with Zod.

**Data & events:** Prisma schema, migrations, idempotency on send, domain events (email.events.ts, eventBus.ts), worker (email.worker.ts), consumers (analytics, campaign).

**Auth:** OAuth 2.0 (Passport Google/LinkedIn), JWT after login/OAuth, authMiddleware (req.user), bcryptjs, CORS.

**AI:** Prompt building in ai.service, OpenAI-compatible (Groq) chat completions, /api/ai/personalize, rewrite, score.

---

## 18. Error Handling & API Patterns

**Error response:** `{ error: { code, message, details?, timestamp, request_id } }`. **Retry:** Exponential backoff; max 3 for email; idempotency prevents duplicate sends. **Pagination:** `data[]`, `pagination: { page, limit, total, totalPages }`. **Filtering:** e.g. `GET /campaigns?status=active&sort=created_at&order=desc`. **Webhooks (outgoing):** event, timestamp, data (emailId, campaignId, leadId, etc.).

---

## 19. Quick Reference: Where Things Live

**Frontend:** Core: `src/core/router.tsx`, `src/core/providers/` (QueryProvider, AuthProvider). Features: `src/features/<feature>/` (pages, components, hooks, api, types). Shared: `src/shared/api/`, layout/, constants/, types/, utils/.

**Backend:** App: `src/app/app.ts`, routes.ts, server.ts. Modules: `src/modules/<domain>/` (*.routes, *.controller, *.service, *.repository). Infrastructure: `src/infrastructure/` (prisma, queue, eventBus, smtp, logger). Config: `src/config/env.ts`. Shared: `src/shared/middleware/`, errors/, types/.

**Key files:** DATA_FLOW_AND_SCHEMA.md (page→API→tables); ARCHITECTURE_AND_TECH.md (rating, pros/cons, tech); LUMINA_FLOW.md (end-to-end); API_ENDPOINTS_MVP.md (API spec); schema.prisma in backend/database/prisma.

---

## 20. Data Flow One-Page Diagram (from DATA_FLOW_AND_SCHEMA)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND PAGES                                                                   │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────────┤
│ Dashboard    │ Compose      │ Campaigns    │ Prospects   │ Templates            │
│ /            │ /compose     │ /campaigns   │ /prospects  │ /templates           │
│              │              │ /new, /:id   │             │ /new, /:id            │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴──────────┬───────────┘
       │              │              │              │                  │
       ▼              ▼              ▼              ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ /api/        │ │ /api/emails  │ │ /api/       │ │ /api/        │ │ /api/        │
│ dashboard/*  │ │ draft, send   │ │ campaigns   │ │ prospects    │ │ templates    │
│              │ │ /api/prospects│ │             │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │                │
       ▼                ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ BACKEND: Controllers → Services → Repositories (Prisma)                            │
└──────────────────────────────────────────────────────────────────────────────────┘
       │                │                │                │                │
       ▼                ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ TABLES: User, OAuthConnection | EmailDraft, Email, EmailOpenEvent, EmailReplyEvent │
│         Prospect, Campaign, CampaignProspect | Template | CompanyData             │
└──────────────────────────────────────────────────────────────────────────────────┘
       │
       │  Webhooks: POST /api/webhooks/email/open, /reply, GET open-pixel
       │  → Publish EMAIL_OPENED / EMAIL_REPLIED (Redis)
       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ EVENT CONSUMERS (Redis subscribe)                                                 │
│ Analytics: EMAIL_OPENED → EmailOpenEvent; EMAIL_REPLIED → EmailReplyEvent          │
│ Campaign:  EMAIL_REPLIED → CampaignProspect.status = REPLIED                      │
│            EMAIL_QUEUED / EMAIL_SENT → Campaign status (e.g. ACTIVE)              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 21. Lumina End-to-End Flow Steps (from LUMINA_FLOW)

1. **User enters composer** — GET draft; editor init; no AI.  
2. **Draft editing loop** — User types → local state → debounced POST /emails/draft (idempotent).  
3. **AI suggestion trigger** — e.g. "Personalize" → POST /ai/personalize, /rewrite, /score; Glow: Idle → Thinking.  
4. **AI orchestrator** — Fetch draft, prospect, company; build prompt; call LLM; no DB writes, no side effects.  
5. **AI response** — Glow: Thinking → Suggestion Ready; suggestion in UI state; confidence/freshness encoding.  
6. **User decision** — Accept / Edit / Reject; stale detection if user edits after suggestion.  
7. **Accept suggestion** — Apply locally → POST /emails/draft; optional POST /ai/feedback async.  
8. **Pre-send validation** — Optional POST /ai/score (advisory).  
9. **User clicks send** — Idempotency key; POST /emails/send; button disabled.  
10. **Send API** — Validate; create Email row PENDING_SEND; no SENT yet.  
11. **Queue enqueue** — Job with email_id; API returns success; user sees "sent".  
12. **Worker** — Load email; send via SMTP; update SENT/sentAt/providerMessageId; publish EMAIL_SENT.  
13. **Provider events** — Webhooks → validate → append to event log (EmailOpenEvent, EmailReplyEvent).  
14. **Analytics & learning** — Consumers read events; dashboard/template metrics; eventually consistent.  
15. **Failure handling** — Idempotency for sends; retry for worker; AI/analytics failures don’t block send.

---

## 22. System Design Phases & Error Categories (from SYSTEM_DESIGN)

**Phase 1 (MVP):** User registration/auth, Gmail OAuth, email composition, template library, AI generation, tone/subject/grammar, send via Gmail, draft, variable replacement, open tracking, basic analytics, preview.  

**Phase 2 (Automation):** Multi-step sequences (5 steps), delay/conditions, lead import, campaigns, reply detection, campaign dashboard.  

**Phase 3–8:** Company lookup, news/tech stack, analytics dashboard, teams/RBAC, CRM/Calendly/Slack/Zapier, mobile/extension, enterprise (SSO, audit, warmup).  

**Error categories:** Authentication (401), Authorization (403), Validation (400), Not Found (404), Rate Limit (429), Server (500). Retry: exponential backoff; max 3 for email; dead letter queue; circuit breaker for external APIs.

---

## 23. Frontend Constants & API Client (current)

**ROUTES** (shared/constants): LOGIN, SIGNUP, AUTH_CALLBACK, DASHBOARD, CAMPAIGNS, CAMPAIGNS_NEW, CAMPAIGNS_VIEW, TEMPLATES, TEMPLATES_NEW, TEMPLATES_EDIT, COMPOSE, PROSPECTS.  

**API_ENDPOINTS:** DRAFTS `/api/emails/draft`, EMAILS `/api/emails`, PROSPECTS `/api/prospects`, TEMPLATES `/api/templates`, AI_PERSONALIZE, AI_REWRITE, AI_SCORE.  

**apiRequest(path, options):** Uses `path` as full or relative URL; adds `Authorization: Bearer <token>` from `localStorage.auth_token` when `auth !== false`; throws on !response.ok; returns JSON or {} for 204.

---

*Combined from: README.md, SETUP.md, DATA_FLOW_AND_SCHEMA.md, DASHBOARD_REALTIME_PLAN.md, DASHBOARD_IMPLEMENTATION.md, MVP_ARCHITECTURE_SUMMARY.md, LUMINA_FLOW.md, API_ENDPOINTS_MVP.md, ARCHITECTURE_FRONTEND.md, ARCHITECTURE_AND_TECH.md, ARCHITECTURE_DIAGRAMS.md, PROJECT_STRUCTURE.md, TECHNOLOGY_STACK.md, CAMPAIGNS_AND_DASHBOARD.md, SYSTEM_DESIGN.md, ARCHITECTURE.md. Updated to match current codebase: scripts (dev, dev:all, worker, consumers), health at root, env (APP_URL, GROQ_MODEL default), Prisma schema (Template.content, enums), routes (campaign auth on router, webhooks under /api/webhooks), elevator pitch and cons. No crucial points removed.*
