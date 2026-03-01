# Sales Copilot – Data Flow & Schema by Page

This document maps **every page** to the APIs it calls, and each API to **backend services and database tables**. It also describes **event-driven flows** (webhooks → events → consumers → tables).

---

## 1. Frontend routes (pages)

| Route | Page component | Auth |
|-------|----------------|------|
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

All API requests (except auth) send `Authorization: Bearer <token>` (JWT from `localStorage.auth_token`). Base URL: `VITE_API_URL` or `/api`.

---

## 2. Page → API → Backend → Tables

### 2.1 Dashboard (`/`)

**Page:** `frontend/src/features/dashboard/pages/Dashboard.tsx`  
**Data:** `useDashboard()` (React Query) → `dashboardApi` in `frontend/src/features/dashboard/api/dashboard.api.ts`

| Frontend call | HTTP | Backend route | Controller | Service | Tables read |
|---------------|------|---------------|------------|---------|-------------|
| `getStats()` | GET | `/api/dashboard/stats` | dashboard.controller `getStats` | dashboard.service `getDashboardStats` | **User** (via userId), **Email** (count SENT, sentAt), **EmailOpenEvent**, **EmailReplyEvent**, **Campaign** (count ACTIVE) |
| `getTimeline(days)` | GET | `/api/dashboard/timeline?days=7` | `getTimeline` | `getDashboardTimeline` | **Email** (userId, SENT, sentAt), **EmailOpenEvent** (openedAt), **EmailReplyEvent** (repliedAt), **Prospect** (via Email.prospect) |
| `getMomentum()` | GET | `/api/dashboard/momentum` | `getMomentum` | `getDashboardMomentum` | **EmailOpenEvent**, **EmailReplyEvent**, **Email**, **Prospect** |
| `getCampaigns()` | GET | `/api/dashboard/campaigns` | `getCampaigns` | `getDashboardCampaigns` → `getCampaignMetrics` | **Campaign** (ACTIVE/DRAFT), **Email** (campaignId, SENT), **EmailOpenEvent**, **EmailReplyEvent** (via analytics) |

**Tables used on Dashboard:** User (implicit), Email, EmailOpenEvent, EmailReplyEvent, Campaign, Prospect (via Email).

---

### 2.2 Compose / Email Composer (`/compose`)

**Page:** `frontend/src/features/email/pages/EmailComposer.tsx`  
**APIs used:** direct `apiRequest` to `API_ENDPOINTS.*` and `useEmailDraft` hook.

| Frontend call | HTTP | Backend route | Controller | Service / Layer | Tables |
|---------------|------|---------------|------------|-----------------|--------|
| Lookup prospect by email | GET | `/api/prospects?email=...` | prospect.controller `list` | prospect.service → prospect.repository | **Prospect** (read) |
| Create prospect | POST | `/api/prospects` | prospect.controller `create` | prospect.service → prospect.repository | **Prospect** (create) |
| Save draft | POST | `/api/emails/draft` | email.controller `upsertDraftHandler` | email.service `upsertDraft` → email.repository | **EmailDraft** (create/update), link **Prospect** |
| Send email | POST | `/api/emails/send` | email.controller `sendEmail` | email.service `createEmailSend` → email.repository; enqueue job | **Email** (create PENDING_SEND), **EmailDraft** (read) |
| Get sent email status | GET | `/api/emails/:id` | email.controller `getEmail` | email.service `getEmailById` → email.repository | **Email** (read) |
| AI personalize | POST | `/api/ai/personalize` | ai.controller `personalize` | ai.service (external API) | None |
| AI rewrite | POST | `/api/ai/rewrite` | ai.controller `rewrite` | ai.service (external API) | None |
| AI score | POST | `/api/ai/score` | ai.controller `score` | ai.service (external API) | None |

**Tables used on Compose:** Prospect (read/create), EmailDraft (read/create/update), Email (create, then read after send).  
**Background:** Send creates an **Email** row and enqueues a job; **email worker** sends via SMTP, updates **Email** (SENT/failed), and publishes **EMAIL_SENT** (see Event flow below).

---

### 2.3 Campaigns list (`/campaigns`)

**Page:** `frontend/src/features/campaigns/pages/Campaigns.tsx`  
**Data:** `useCampaigns({ status })` → `campaignsApi.list()` in `frontend/src/features/campaigns/api/campaigns.api.ts`

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| List campaigns | GET | `/api/campaigns?status=...&limit=...&offset=...` | campaign.controller `list` | campaign.service `listCampaigns` | **Campaign** (userId, status), **_count** on **Email** |

---

### 2.4 Create Campaign (`/campaigns/new`)

**Page:** `frontend/src/features/campaigns/pages/CreateCampaign.tsx`  
**Data:** `useCreateCampaign()`, `useProspects('')` (for audience list).

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| List prospects | GET | `/api/prospects?search=...&limit=...&offset=...` | prospect.controller `list` | prospect.service → prospect.repository | **Prospect** (read) |
| Create campaign (draft or active) | POST | `/api/campaigns` | campaign.controller `create` | campaign.service `createCampaign` | **Campaign** (create), **CampaignProspect** (create many if prospectIds) |

Body for create: `name`, `description`, `startDate`, `endDate`, `workspaceId`, `prospectIds[]`, optional `status` (e.g. `ACTIVE` for “Start Campaign”).

---

### 2.5 Campaign detail (`/campaigns/:id`)

**Page:** `frontend/src/features/campaigns/pages/CampaignDetail.tsx`  
**Data:** `useCampaign(id)`, `useUpdateCampaignStatus()`, `useCampaignProspects(campaignId)`.

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| Get campaign with metrics | GET | `/api/campaigns/:id` | campaign.controller `getById` | campaign.service `getCampaignWithMetrics` → `getCampaignById` + analytics `getCampaignMetrics` | **Campaign**, **Email** (for campaign), **EmailOpenEvent**, **EmailReplyEvent** |
| Update campaign status | PATCH | `/api/campaigns/:id/status` | campaign.controller `updateStatus` | campaign.service `updateCampaignStatus` | **Campaign** (update status) |
| Get campaign prospects | GET | `/api/campaigns/:id/prospects` | campaign.controller `getProspects` | campaign.service `getCampaignProspects` | **Campaign**, **CampaignProspect**, **Prospect** |

**Tables used:** Campaign, Email, EmailOpenEvent, EmailReplyEvent, CampaignProspect, Prospect.  
**UI:** “Replied” count and prospect status column come from: metrics from **EmailReplyEvent**; status column from **CampaignProspect.status** (updated by campaign consumer on **EMAIL_REPLIED**).

---

### 2.6 Prospects (`/prospects`)

**Page:** `frontend/src/features/prospects/pages/Prospects.tsx`  
**Data:** `useProspects(search)`, `useCreateProspect()`; API in `frontend/src/features/prospects/api/prospects.api.ts`.

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| List prospects | GET | `/api/prospects?search=...&limit=...&offset=...` | prospect.controller `list` | prospect.service → prospect.repository | **Prospect** (read, search, paginate) |
| Create prospect | POST | `/api/prospects` | prospect.controller `create` | prospect.service → prospect.repository | **Prospect** (create) |

Other prospect APIs (used elsewhere or for future): GET `/api/prospects/:id`, PATCH `/api/prospects/:id`, DELETE `/api/prospects/:id` → **Prospect** (read/update/delete).

---

### 2.7 Templates list (`/templates`)

**Page:** `frontend/src/features/templates/pages/Templates.tsx`  
**Data:** Fetches via `apiRequest(API_ENDPOINTS.TEMPLATES)?limit=200`.

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| List templates | GET | `/api/templates?limit=200` | template.controller `list` | template.service → template.repository | **Template** (userId) |

---

### 2.8 Create Template (`/templates/new`)

**Page:** `frontend/src/features/templates/pages/CreateTemplate.tsx`

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| Create template | POST | `/api/templates` | template.controller `create` | template.service → template.repository | **Template** (create) |

---

### 2.9 Edit Template (`/templates/:id`)

**Page:** `frontend/src/features/templates/pages/EditTemplate.tsx`

| Frontend call | HTTP | Backend route | Controller | Service | Tables |
|---------------|------|---------------|------------|---------|--------|
| Get template | GET | `/api/templates/:id` | template.controller `getOne` | template.service → template.repository | **Template** (read) |
| Update template | PATCH | `/api/templates/:id` | template.controller `update` | template.service → template.repository | **Template** (update) |

---

### 2.10 Auth (Login, Signup, OAuth callback)

**Pages:** `Login.tsx`, `Signup.tsx`, `AuthCallback.tsx`

| Action | HTTP | Backend route | Controller | Service / Layer | Tables |
|--------|------|---------------|------------|-----------------|--------|
| Signup | POST | `/api/auth/signup` | auth.controller `signup` | auth.service → auth.repository | **User** (create) |
| Login | POST | `/api/auth/login` | auth.controller `login` | auth.service (JWT issue) | **User** (read) |
| Google OAuth | GET | `/api/auth/google` | passport + oauth.controller | auth + passport | **User**, **OAuthConnection** |
| Google callback | GET | `/api/auth/google/callback` | oauth.controller `oauthCallback` | auth (upsert user, JWT) | **User**, **OAuthConnection** |
| LinkedIn (same pattern) | GET | `/api/auth/linkedin`, `/api/auth/linkedin/callback` | same | same | **User**, **OAuthConnection** |

---

## 3. Backend API route summary (full list)

Prefix: `/api` (from `app.use("/api", routes)`).

| Method | Path | Auth | Controller | Tables touched |
|--------|------|------|------------|----------------|
| POST | `/auth/signup` | No | auth.signup | User |
| POST | `/auth/login` | No | auth.login | User |
| GET | `/auth/google` | No | passport | - |
| GET | `/auth/google/callback` | No | oauth.oauthCallback | User, OAuthConnection |
| GET | `/auth/linkedin` | No | passport | - |
| GET | `/auth/linkedin/callback` | No | oauth.oauthCallback | User, OAuthConnection |
| GET | `/dashboard/stats` | Yes | dashboard.getStats | Email, EmailOpenEvent, EmailReplyEvent, Campaign |
| GET | `/dashboard/timeline` | Yes | dashboard.getTimeline | Email, EmailOpenEvent, EmailReplyEvent, Prospect |
| GET | `/dashboard/momentum` | Yes | dashboard.getMomentum | EmailOpenEvent, EmailReplyEvent, Email, Prospect |
| GET | `/dashboard/campaigns` | Yes | dashboard.getCampaigns | Campaign, Email, EmailOpenEvent, EmailReplyEvent |
| GET | `/emails/drafts/:id` | Yes | email.getDraft | EmailDraft |
| POST | `/emails/draft` | Yes | email.upsertDraftHandler | EmailDraft |
| DELETE | `/emails/draft/:id` | Yes | email.deleteDraftHandler | EmailDraft |
| POST | `/emails/send` | Yes | email.sendEmail | Email, EmailDraft |
| GET | `/emails/:id` | Yes | email.getEmail | Email |
| GET | `/prospects` | Yes | prospect.list | Prospect |
| GET | `/prospects/:id` | Yes | prospect.getOne | Prospect |
| POST | `/prospects` | Yes | prospect.create | Prospect |
| PATCH | `/prospects/:id` | Yes | prospect.update | Prospect |
| DELETE | `/prospects/:id` | Yes | prospect.remove | Prospect |
| GET | `/templates` | Yes | template.list | Template |
| GET | `/templates/:id` | Yes | template.getOne | Template |
| POST | `/templates` | Yes | template.create | Template |
| PATCH | `/templates/:id` | Yes | template.update | Template |
| DELETE | `/templates/:id` | Yes | template.remove | Template |
| GET | `/campaigns` | Yes | campaign.list | Campaign |
| GET | `/campaigns/:id` | Yes | campaign.getById | Campaign, Email, EmailOpenEvent, EmailReplyEvent |
| GET | `/campaigns/:id/prospects` | Yes | campaign.getProspects | Campaign, CampaignProspect, Prospect |
| POST | `/campaigns` | Yes | campaign.create | Campaign, CampaignProspect |
| PATCH | `/campaigns/:id/status` | Yes | campaign.updateStatus | Campaign |
| POST | `/ai/personalize` | Yes | ai.personalize | - |
| POST | `/ai/rewrite` | Yes | ai.rewrite | - |
| POST | `/ai/score` | Yes | ai.score | - |
| POST | `/ai/feedback` | Yes | ai.feedback | - |
| POST | `/webhooks/email/open` | No | webhook.emailOpenWebhook | - (only publish) |
| GET | `/webhooks/email/open-pixel` | No | webhook.emailOpenPixel | - (only publish) |
| POST | `/webhooks/email/reply` | No | webhook.emailReplyWebhook | - (only publish) |

---

## 4. Event-driven data flow (webhooks → events → consumers → tables)

### 4.1 Email send flow (from Compose or campaign)

1. **API:** `POST /api/emails/send` → email.controller `sendEmail` → email.service `createEmailSend`.
2. **Tables:** **Email** row created (status `PENDING_SEND`), job enqueued (BullMQ, Redis).
3. **Worker:** `email.worker` picks job → SMTP send → **Email** updated (status `SENT`, sentAt, providerMessageId) or `FAILED`.
4. **Event:** Worker publishes **EMAIL_SENT** (Redis channel `sales-copilot:events`).
5. **Consumers:**
   - **Campaign consumer:** If campaign was DRAFT and first email queued/sent, can activate campaign → **Campaign** (status update).
   - **Analytics consumer:** Subscribes to EMAIL_SENT (template metrics logic; no DB writes in current snippet).

### 4.2 Open tracking flow

1. **Webhook:** `POST /webhooks/email/open` or GET `/webhooks/email/open-pixel?email_id=...` → webhook.controller.
2. **Read:** **Email** (find by id).
3. **Publish:** **EMAIL_OPENED** (emailId, openedAt).
4. **Analytics consumer:** `recordEmailOpened` → **EmailOpenEvent** (create).
5. **Campaign consumer:** Subscribes but no DB write (engagement tracking placeholder).

**Tables written:** **EmailOpenEvent**.

### 4.3 Reply tracking flow

1. **Webhook:** `POST /webhooks/email/reply` (body: email_id, reply_subject, reply_body) → webhook.controller.
2. **Read:** **Email** (find by id).
3. **Publish:** **EMAIL_REPLIED** (emailId, repliedAt, replySubject, replyBody).
4. **Analytics consumer:** `recordEmailReplied` → **EmailReplyEvent** (create). Optional template metrics (Template not written in current code).
5. **Campaign consumer:** `onEmailReplied` → read **Email** (campaignId, prospectId) → **CampaignProspect** updateMany where campaignId + prospectId → `status = 'REPLIED'`.

**Tables written:** **EmailReplyEvent**, **CampaignProspect** (status).

**UI impact:** Dashboard stats/timeline/momentum and campaign metrics use **EmailReplyEvent**. Campaign detail prospect list uses **CampaignProspect.status** (Replied count and status column).

---

## 5. Database schema (all tables)

Source: `backend/database/prisma/schema.prisma`.

### 5.1 User & auth

- **User**  
  id, email (unique), passwordHash, firstName, lastName, role (enum: admin, user), createdAt, updatedAt.  
  Relations: drafts, emails, oauth, templates, campaigns.

- **OAuthConnection**  
  id, userId, provider, emailAddress, accessToken, refreshToken, tokenExpiresAt, createdAt, updatedAt.  
  Relation: user.

### 5.2 Email lifecycle

- **EmailDraft**  
  id, userId, workspaceId, prospectId, subject, bodyHtml, bodyText, createdAt, updatedAt.  
  Relations: user, prospect, emails.

- **Email**  
  id, draftId, userId, workspaceId, prospectId, campaignId, fromEmail, toEmail, subject, bodyHtml, bodyText, status (enum: PENDING_SEND, SENT, FAILED, BOUNCED), idempotencyKey (unique), providerMessageId, sentAt, createdAt, updatedAt.  
  Relations: user, draft, prospect, campaign, openEvents, replyEvents.

- **EmailOpenEvent**  
  id, emailId, openedAt, createdAt.  
  Relation: email (cascade delete). Indexes: emailId, openedAt.

- **EmailReplyEvent**  
  id, emailId, repliedAt, replySubject, replyBody, createdAt.  
  Relation: email (cascade delete). Indexes: emailId, repliedAt.

### 5.3 Prospects & campaigns

- **Prospect**  
  id, workspaceId, email, firstName, lastName, company, jobTitle, customFields (JSON), createdAt, updatedAt.  
  Relations: drafts, emails, campaignProspects.

- **Campaign**  
  id, userId, workspaceId, name, description, status (enum: DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED), startDate, endDate, createdAt, updatedAt.  
  Relations: user, emails, campaignProspects.

- **CampaignProspect**  
  id, campaignId, prospectId, status (enum: ACTIVE, REPLIED), currentStep, createdAt, updatedAt.  
  Unique (campaignId, prospectId). Relations: campaign, prospect. Indexes: campaignId, prospectId.

### 5.4 Templates & company

- **Template**  
  id, userId, workspaceId, title, description, content, category, tone, usedCount, openRate, replyRate, isFavorite, createdAt, updatedAt.  
  Relation: user.

- **CompanyData**  
  id, domain (unique), name, industry, size, location, metadata (JSON), createdAt, updatedAt.  
  (Not referenced by current API flows above; available for enrichment.)

---

## 6. One-page flow overview

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
       │  Webhooks: POST /webhooks/email/open, /reply, GET open-pixel
       │  → Publish EMAIL_OPENED / EMAIL_REPLIED (Redis)
       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ EVENT CONSUMERS (Redis subscribe)                                                 │
│ Analytics: EMAIL_OPENED → EmailOpenEvent; EMAIL_REPLIED → EmailReplyEvent          │
│ Campaign:  EMAIL_REPLIED → CampaignProspect.status = REPLIED                      │
│            EMAIL_QUEUED / EMAIL_SENT → Campaign status (e.g. ACTIVE)              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

This is the detailed data flow and table schema by page and API for the Sales Copilot app.
