## Campaigns – Technical Overview (Backend)

This document explains how **campaigns** work end‑to‑end for developers: data model, state machine, event flow, workers, and HTTP APIs.

---

## 1. Domain Model

### 1.1 Core entities

- `**Campaign`**
  - Owned by a `User` (and optionally a `Workspace`).
  - High‑level email outreach sequence over a set of prospects.
  - Key fields (from Prisma schema, inferred from usage):
    - `id: string`
    - `userId: string`
    - `workspaceId?: string | null`
    - `name: string`
    - `description?: string | null`
    - `status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"`
    - `startDate?: Date | null`
    - `endDate?: Date | null`
    - Timestamps: `createdAt`, `updatedAt`
- `**CampaignProspect**`
  - Join table that tracks each prospect’s progression through a campaign sequence.
  - Created in bulk when a campaign is created with `prospectIds`.
  - Defined in the migration:

```sql
-- 20260228181315_add_campaign_prospect/migration.sql
CREATE TYPE "CampaignProspectStatus" AS ENUM ('ACTIVE', 'REPLIED');

CREATE TABLE "CampaignProspect" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "prospectId" TEXT NOT NULL,
  "status" "CampaignProspectStatus" NOT NULL DEFAULT 'ACTIVE',
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampaignProspect_pkey" PRIMARY KEY ("id")
);
```

- Effective shape in TypeScript (from usage):
  - `id: string`
  - `campaignId: string`
  - `prospectId: string`
  - `status: "ACTIVE" | "REPLIED" | "COMPLETED"` (COMPLETED is used in code even though the enum originally only had ACTIVE/REPLIED; see notes below.)
  - `currentStep: number` – 0‑based index of where the prospect is in the sequence.
- `**Email**`
  - Not defined here, but key fields used by campaign logic:
    - `id`
    - `campaignId?: string | null`
    - `prospectId?: string | null`
    - `userId`
    - Lifecycle events: `EMAIL_QUEUED`, `EMAIL_SENT`, `EMAIL_OPENED`, `EMAIL_REPLIED`.

---

## 2. Sequence Configuration

File: `backend/api/src/modules/campaign/sequence.config.ts`

- The campaign sequence is **static** and defined as a list of steps with relative delays:

```12:21:backend/api/src/modules/campaign/sequence.config.ts
export const SEQUENCE = [
  { step: 1, delayDays: 0 },
  { step: 2, delayDays: 3 },
  { step: 3, delayDays: 5 },
  { step: 4, delayDays: 7 },
  { step: 5, delayDays: 10 },
] as const;

export const SEQUENCE_MAX_STEP = SEQUENCE.length;

export function getDelayMsForStep(step: number): number | undefined {
  const entry = SEQUENCE.find((s) => s.step === step);
  if (!entry) return undefined;
  return entry.delayDays * 24 * 60 * 60 * 1000;
}
```

- **Step numbers are 1‑based**, `currentStep` on `CampaignProspect` is 0‑based:
  - When `currentStep = 0` ⇒ next email is **step 1**.
  - After sending step `N`, `currentStep` is incremented to `N`.
- **Delay semantics**:
  - `delayDays` is the number of days **from the moment we schedule** a given step.
  - `delayDays = 0` means “send immediately”.

---

## 3. Status State Machine

### 3.1 Campaign status

Declared statuses:

```53:55:backend/api/src/modules/campaign/campaign.service.ts
const CAMPAIGN_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;
export type CampaignStatusType = (typeof CAMPAIGN_STATUSES)[number];
```

- `**DRAFT**`
  - Initial status when created (unless explicitly passed as `ACTIVE`).
  - No automatic scheduling is triggered unless:
    - `createCampaign` is called with `status: "ACTIVE"`, or
    - an email is queued/sent, which triggers auto‑activation in the consumer.
- `**ACTIVE**`
  - Campaign is running: emails are being scheduled and sent.
  - When transitioning to `ACTIVE`:
    - Prospects with `currentStep = 0` get their first step scheduled.
    - For subsequent steps, scheduling is driven by `EMAIL_SENT` events.
- `**PAUSED**`
  - Currently only a status flag; no additional logic in consumers/workers.
  - Important: BullMQ delayed jobs already queued **will still fire**; pausing does not cancel scheduled jobs. If you need full pause semantics, additional logic is required (see extension ideas).
- `**COMPLETED`**
  - Set when:
    - The campaign’s `endDate` is in the past at the time of an `EMAIL_SENT` event, or
    - Potentially by future manual action.
  - Once `COMPLETED`, new steps should not be scheduled (but note: current implementation does not explicitly guard against that in the worker; see edge cases).
- `**ARCHIVED**`
  - Long‑term storage state; currently no special logic beyond the status value.

#### Status transitions (current behavior)

- `DRAFT` → `ACTIVE`
  - Manual: via `PATCH /api/campaigns/:id/status` with `{ status: "ACTIVE" }`.
  - Automatic:
    - On `EMAIL_QUEUED` if campaign is still `DRAFT`.
    - On `EMAIL_SENT` if campaign is still `DRAFT`.
- `ACTIVE` → `COMPLETED`
  - Automatic: on `EMAIL_SENT` when `endDate` has passed.
- `ACTIVE` ↔ `PAUSED`, `ACTIVE`/`PAUSED` → `ARCHIVED`, etc.
  - Manual: via HTTP status update endpoint.

There is **no explicit guard** preventing sending emails for `PAUSED`/`COMPLETED`/`ARCHIVED` campaigns in the worker; behavior relies on the campaign being `ACTIVE` when a job executes (see `executeCampaignStep`).

### 3.2 CampaignProspect status

Effective states from code:

- `ACTIVE` – prospect is still in the sequence and can receive more steps.
- `REPLIED` – set when a reply is detected for any email tied to the prospect+campaign.
- `COMPLETED` – used when the last step has been executed without reply (set in consumer logic).

Key logic:

```61:78:backend/api/src/modules/campaign/campaign.consumer.ts
const cp = await prisma.campaignProspect.findFirst({ ... });
if (cp) {
  const newStep = cp.currentStep + 1;
  const status: CampaignProspectStatus =
    newStep >= SEQUENCE_MAX_STEP && cp.status === "ACTIVE"
      ? ("COMPLETED" as CampaignProspectStatus)
      : cp.status;
  await prisma.campaignProspect.update({
    where: { id: cp.id },
    data: { currentStep: newStep, status },
  });
  ...
}
```

- When `EMAIL_SENT` is processed for a given `prospectId` and `campaignId`:
  - `currentStep` is incremented by 1.
  - If this reaches/exceeds `SEQUENCE_MAX_STEP` while status is `ACTIVE`, the prospect is marked `COMPLETED`.
  - If status changed earlier to `REPLIED`, it will stay `REPLIED`.

Reply semantics:

```106:120:backend/api/src/modules/campaign/campaign.consumer.ts
const email = await prisma.email.findUnique({ ... });
if (!email?.campaignId || !email?.prospectId) return;

await prisma.campaignProspect.updateMany({
  where: {
    campaignId: email.campaignId,
    prospectId: email.prospectId,
  },
  data: { status: "REPLIED" },
});
```

- When an `EMAIL_REPLIED` event is received:
  - All `CampaignProspect` rows for that prospect+campaign are set to `REPLIED`.
  - No further protection currently exists to stop already‑queued steps; this may be added by checking status inside the worker.

---

## 4. Scheduling & Workers

### 4.1 Queue shape

- Queue: `"campaign-step"` (BullMQ).
- Job data type `CampaignStepJobData` (see `infrastructure/queue`):
  - `{ campaignId: string; prospectId: string; userId: string; stepNumber: number }`.

Jobs are enqueued via `enqueueCampaignStep`, with a delay computed from `getDelayMsForStep(stepNumber)`.

### 4.2 Worker

File: `backend/api/src/modules/campaign/sequence.worker.ts`

```1:21:backend/api/src/modules/campaign/sequence.worker.ts
const worker = new Worker<CampaignStepJobData>(
  "campaign-step",
  async (job) => {
    const { campaignId, prospectId, userId, stepNumber } = job.data;
    await executeCampaignStep({ campaignId, prospectId, userId, stepNumber });
  },
  connection
);
```

- The worker is responsible for **executing a specific step** for a single prospect in a campaign.
- Failure handling: logs to console when a job fails; no retry/backoff customization defined here (relies on queue defaults).

### 4.3 Step execution

File: `backend/api/src/modules/campaign/campaign.service.ts`

```195:235:backend/api/src/modules/campaign/campaign.service.ts
export const executeCampaignStep = async (payload: {
  campaignId: string;
  prospectId: string;
  userId: string;
  stepNumber: number;
}) => {
  const [campaign, prospect, user] = await Promise.all([
    prisma.campaign.findFirst({
      where: { id: payload.campaignId, userId: payload.userId },
      select: { id: true, workspaceId: true, status: true },
    }),
    prisma.prospect.findUnique({
      where: { id: payload.prospectId },
      select: { email: true, firstName: true, lastName: true },
    }),
    prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true },
    }),
  ]);

  if (!campaign || campaign.status !== "ACTIVE") return;
  if (!prospect || !user?.email) return;

  const subject = `Follow-up (Step ${payload.stepNumber})`;
  const bodyHtml = `<p>Follow-up step ${payload.stepNumber}.</p>`;
  const idempotencyKey = `${payload.campaignId}-${payload.prospectId}-step-${payload.stepNumber}`;

  await createEmailSend({
    userId: payload.userId,
    workspaceId: campaign.workspaceId ?? undefined,
    prospectId: payload.prospectId,
    campaignId: payload.campaignId,
    fromEmail: user.email,
    toEmail: prospect.email,
    subject,
    bodyHtml,
    bodyText: `Follow-up step ${payload.stepNumber}.`,
    idempotencyKey,
  });
};
```

Key points:

- **Guards**:
  - Campaign must exist and be `ACTIVE`.
  - Prospect must exist and have an email.
  - User must exist and have an email (used as `fromEmail`).
- **Idempotency**:
  - `idempotencyKey` is deterministic by campaign+prospect+step.
  - `createEmailSend` is expected to enforce idempotency, so re‑running the job should not send duplicates.
- **Content**:
  - Currently uses placeholder subject/body; intended to be extended with per‑step templates later.

---

## 5. Event‑Driven Campaign Engine

File: `backend/api/src/modules/campaign/campaign.consumer.ts`

- Subscribes to email domain events:

```147:153:backend/api/src/modules/campaign/campaign.consumer.ts
subscribe(
  [EMAIL_QUEUED, EMAIL_SENT, EMAIL_OPENED, EMAIL_REPLIED],
  (event) => handle(event)
);
```

### 5.1 EMAIL_QUEUED

```26:40:backend/api/src/modules/campaign/campaign.consumer.ts
async function onEmailQueued(payload: EmailQueuedPayload): Promise<void> {
  if (!payload.campaignId) return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
  });
  if (!campaign) return;

  if (campaign.status === "DRAFT") {
    await updateCampaignStatus(payload.campaignId, payload.userId, "ACTIVE");
  }
}
```

- Auto‑activates campaigns on the first queued email.
- This makes it safe for callers to create campaigns in `DRAFT` and just start sending; the system flips to `ACTIVE` automatically.

### 5.2 EMAIL_SENT

```42:60:backend/api/src/modules/campaign/campaign.consumer.ts
async function onEmailSent(payload: EmailSentPayload): Promise<void> {
  if (!payload.campaignId) return;

  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
  });
  if (!campaign) return;

  if (campaign.status === "DRAFT") {
    await updateCampaignStatus(payload.campaignId, payload.userId, "ACTIVE");
  }

  if (campaign.endDate && new Date() >= campaign.endDate) {
    await updateCampaignStatus(payload.campaignId, payload.userId, "COMPLETED");
  }

  // Step tracking and scheduling (see §3.2)
  ...
}
```

- Ensures campaigns are not stuck in `DRAFT` even if earlier events were missed.
- Drives the **step progression** and **next‑step scheduling** for each prospect, using `SEQUENCE_MAX_STEP` and `getDelayMsForStep`.

### 5.3 EMAIL_OPENED

- Currently a no‑op in this consumer; engagement is tracked elsewhere (analytics module).
- Placeholder for future behavior such as branch logic (e.g., “if not opened after X days, resend with new subject”).

### 5.4 EMAIL_REPLIED

- Marks the corresponding `CampaignProspect` as `REPLIED` (see §3.2).
- This is where reply‑driven stop rules are enforced at the data level.

---

## 6. HTTP API Layer

File: `backend/api/src/modules/campaign/campaign.routes.ts`

```11:18:backend/api/src/modules/campaign/campaign.routes.ts
campaignRoutes.use(authMiddleware);
campaignRoutes.get("/", list);
campaignRoutes.get("/:id/prospects", getProspects);
campaignRoutes.get("/:id", getById);
campaignRoutes.post("/", create);
campaignRoutes.patch("/:id/status", updateStatus);
```

All routes are **authenticated** (`authMiddleware`).

### 6.1 `GET /api/campaigns`

Controller: `list`

```10:29:backend/api/src/modules/campaign/campaign.controller.ts
const status = req.query.status as string | undefined;
const limit = Math.min(parseInt(String(req.query.limit)) || 50, 100);
const offset = parseInt(String(req.query.offset)) || 0;
const result = await listCampaigns({
  userId,
  status: status || undefined,
  limit,
  offset,
});
```

- Returns paginated campaigns for the authenticated user:
  - Query params: `status?`, `limit?`, `offset?`.
  - Response: `{ total, campaigns }`, where `campaigns` includes `_count.emails`.

### 6.2 `GET /api/campaigns/:id`

Controller: `getById`

- Uses `getCampaignWithMetrics(id, userId)`:
  - Fetches the campaign with basic email info and metrics from `analytics.service`.
  - Returns 404 if campaign not found or user does not own it.

### 6.3 `POST /api/campaigns`

Controller: `create`

```63:73:backend/api/src/modules/campaign/campaign.controller.ts
const { name, description, startDate, endDate, workspaceId, prospectIds, status } = req.body;
const campaign = await createCampaign({
  userId,
  workspaceId: workspaceId ?? null,
  name: name || "Untitled Campaign",
  description: description ?? null,
  startDate: startDate ? new Date(startDate) : null,
  endDate: endDate ? new Date(endDate) : null,
  prospectIds: Array.isArray(prospectIds) ? prospectIds : undefined,
  status: status || undefined,
});
```

- Side effects:
  - Creates a `Campaign`.
  - If `prospectIds` is provided:
    - Creates `CampaignProspect` rows in bulk.
    - If `status` resolves to `ACTIVE`, **immediately enqueues step 1** for all prospects with the configured delay.

### 6.4 `GET /api/campaigns/:id/prospects`

Controller: `getProspects`

- Validates that the campaign belongs to the current user.
- Returns a list of prospects with denormalized info and progress:
  - `prospectId`, `name`, `email`, `company`, `status`, `currentStep`.

### 6.5 `PATCH /api/campaigns/:id/status`

Controller: `updateStatus`

- Validates `status` against the allowed values.
- Uses `updateCampaignStatus` service:
  - Updates campaign status.
  - On transition into `ACTIVE`, finds all `CampaignProspect` records with `currentStep = 0` and enqueues step 1 for each (with delay for step 1).

---

## 7. End‑to‑End Flow Summary

High‑level lifecycle for a single prospect in a campaign:

1. **Campaign creation**
  - `POST /api/campaigns` with `prospectIds` and optional `status`.
  - `CampaignProspect` rows created for each prospect.
  - If created as `ACTIVE`, step 1 jobs are enqueued immediately for all prospects.
2. **Step execution**
  - When a `campaign-step` job fires:
    - `executeCampaignStep` creates an email send for that prospect+step (if campaign is still `ACTIVE`).
    - This results in `EMAIL_QUEUED` and later `EMAIL_SENT` events.
3. **Progression**
  - On `EMAIL_SENT`, the campaign consumer:
    - Ensures the campaign is `ACTIVE` (if still `DRAFT`).
    - Checks `endDate` to potentially mark the campaign `COMPLETED`.
    - Increments `CampaignProspect.currentStep`.
    - If not at final step and still `ACTIVE`, enqueues the next step with the configured delay.
4. **Engagement**
  - On `EMAIL_OPENED`: tracked for analytics (currently no sequence effect).
  - On `EMAIL_REPLIED`:
    - `CampaignProspect.status` is set to `REPLIED` for that prospect+campaign.
    - Future improvements can leverage this to cancel outstanding jobs.
5. **Completion**
  - Prospect: when `currentStep` reaches `SEQUENCE_MAX_STEP` and status is `ACTIVE`, it is set to `COMPLETED`.
  - Campaign: when `endDate` is passed on an `EMAIL_SENT` event, status becomes `COMPLETED`.

---

## 8. Extension & Edge‑Case Notes

- **Pausing campaigns**
  - Currently, `PAUSED` is only a label; queued jobs are not cancelled/checked.
  - To fully support pause:
    - Either cancel delayed jobs on pause, or
    - Add a `if (campaign.status !== "ACTIVE") return;` guard (already present) *and* ensure `EMAIL_SENT` is not triggered for paused campaigns.
- **CampaignProspect status enum**
  - The initial migration defines only `ACTIVE` and `REPLIED`, but code uses `"COMPLETED"`.
  - Ensure the Prisma schema and DB enum are updated accordingly if not already migrated.
- **Idempotency and retries**
  - Worker uses deterministic `idempotencyKey`.
  - If you add retries / backoff, make sure the email service remains strongly idempotent.
- **Dynamic sequences**
  - Today, the sequence is static (`SEQUENCE` constant).
  - To support per‑campaign sequences:
    - Introduce `CampaignStep` table with delays and templates.
    - Replace use of `SEQUENCE`/`SEQUENCE_MAX_STEP` with per‑campaign queries.
- **Analytics**
  - Metrics are computed in `analytics.service` via `getCampaignMetrics(id)` and exposed through `getCampaignWithMetrics`.
  - When extending campaign behavior, ensure events still provide sufficient data for analytics aggregation.

---

## 9. Troubleshooting: Dashboard & campaign metrics not updating

If you sent campaign emails and see opens/replies in your inbox but **dashboard and campaign metrics stay at zero**, check the following.

### 9.1 Event consumers must be running

Opens and replies are written to the database by **consumers** that subscribe to Redis events. If you only start the API (e.g. `npm run dev`), those consumers do **not** run.

- **Fix:** Run the full stack so that analytics and campaign consumers start:
  - `npm run dev:all` (starts API + email worker + sequence worker + **analytics consumer** + **campaign consumer**).
  - Or run consumers in separate processes: `npm run consumer:analytics` and `npm run consumer:campaign`.

Without the analytics consumer, `EMAIL_OPENED` and `EMAIL_REPLIED` events are never turned into `EmailOpenEvent` / `EmailReplyEvent` rows, so dashboard and campaign metrics stay at zero.

### 9.2 Open tracking: pixel URL must be reachable

Open tracking uses a 1×1 image (tracking pixel) injected into each email. When the recipient opens the email, their client requests:

`GET <APP_URL>/webhooks/email/open-pixel?email_id=<uuid>`

- If `APP_URL` is `http://localhost:4000`, that URL is only reachable from your machine. When a real recipient (or you from another device) opens the email, the request fails and no open is recorded.
- **Fix:** Set `APP_URL` to a **public** URL that reaches your backend (e.g. ngrok URL like `https://abc123.ngrok.io`, or your deployed API URL). Restart the API and send new emails; opens for those will be recorded when the pixel loads.

### 9.3 Reply tracking: webhook must be called

Replies are only recorded when something calls:

`POST /webhooks/email/reply`  
Body: `{ "email_id": "<uuid>", "reply_subject": "...", "reply_body": "..." }` (optional fields).

- With **plain SMTP** there is no automatic “reply received” signal. The app does not read your mailbox.
- **Fix:** Use an **inbound email** setup that receives replies and calls this webhook, e.g.:
  - Mailgun Inbound Routes → forward to your `POST /webhooks/email/reply` (with a shared secret in header/query if needed).
  - SendGrid Inbound Parse → webhook to the same URL.
  - Or any other provider that can POST to your backend when a reply is received.

Until something invokes the reply webhook (or you call it manually for testing), reply counts and “Replied” status in campaigns will not update.

### 9.4 Optional: Use Brevo for sending and open tracking

If you set **BREVO_API_KEY**, emails are sent via Brevo’s API and open tracking uses Brevo’s webhooks instead of our pixel (no public APP_URL needed for opens). See **docs/BREVO_SETUP.md** for setup and webhook URL (`POST /webhooks/brevo`).

### 9.5 Quick checklist

| Check | Action |
|-------|--------|
| Consumers running? | Use `npm run dev:all` or run `consumer:analytics` and `consumer:campaign`. |
| Opens still 0? | With SMTP: set `APP_URL` to a public URL. With Brevo: configure Brevo webhook to `POST /webhooks/brevo` (see BREVO_SETUP.md). |
| Replies still 0? | Configure inbound email (Brevo/Mailgun/SendGrid/etc.) to POST to `/webhooks/email/reply`. |

This doc should give developers enough context to safely modify or extend the campaigns engine, add new campaign‑related features, or debug issues end‑to‑end.