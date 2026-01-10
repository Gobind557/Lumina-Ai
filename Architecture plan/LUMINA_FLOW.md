# Lumina AI Sales Copilot - End-to-End Flow Architecture

## Overview

This document describes the complete end-to-end flow from user typing an email to delivery and feedback, following the **Lumina design principles**:

- **Local-First**: User never waits on backend to type
- **AI as Pure Function**: No side effects during AI operations
- **Human-in-the-Loop**: User always controls AI suggestions
- **Idempotent Operations**: Safe retries everywhere
- **Event-Driven Analytics**: Non-blocking, eventually consistent
''; 
---

## Design Principles

### 1. Local-First Editing

- Editor state lives in UI (React state)
- Draft persistence is debounced and non-blocking
- User can type continuously without network delays

### 2. AI as Pure Function

- AI operations never write to database
- AI operations never trigger side effects
- AI returns suggestions, not commands
- All AI calls are idempotent

### 3. Human-in-the-Loop

- AI suggestions are always optional
- User must explicitly accept suggestions
- Manual edits invalidate stale suggestions
- Glow System provides visual feedback

### 4. Deterministic Send Flow

- Send intent is persisted before any side effects
- Idempotency keys prevent duplicate sends
- Worker failures don't lose user intent
- Email record is immutable after creation

### 5. Event-Driven Analytics

- All events append to log (no mutations)
- Analytics are eventually consistent
- Failures don't affect core functionality
- Learning systems consume events asynchronously

---

## End-to-End Flow

### 1. User Enters the Composer (Frontend Initialization)

**State**: `GlowSystem = Idle`, `AI = Inactive`

**Actions**:

- Frontend fetches or creates `email_drafts` record
- Editor initializes with draft content (subject, body)
- Editor state held in local React state
- No AI calls made

**API Calls**:

```
GET /emails/drafts/:id
  → Returns: { id, subject, body, prospect_id, created_at, updated_at }
```

**Key Points**:

- Fully deterministic
- User-controlled
- No network dependency for typing

---

### 2. Draft Editing Loop (Local First, Server Second)

**State**: `GlowSystem = Idle`, `AI = Inactive`

**Actions**:

- User types → changes applied locally
- Debounced draft persistence (500ms delay)
- Idempotent writes via `POST /emails/draft`

**API Calls**:

```
POST /emails/draft
  Body: { id?, subject, body, prospect_id }
  → Returns: { id, updated_at }
```

**Implementation**:

```typescript
// Frontend debounced save
const saveDraft = useDebouncedCallback(async (draft) => {
  await api.post("/emails/draft", draft);
}, 500);
```

**Key Points**:

- User never waits to type
- Safe to retry
- No side effects triggered

---

### 3. AI Suggestion Trigger (Explicit or Debounced)

**State Transition**: `GlowSystem: Idle → Thinking`

**Triggers**:

- User clicks "Personalize" button
- User moves Tone Slider
- System detects meaningful context change (subject/body/prospect change)

**API Calls**:

```
POST /ai/personalize
  Body: { draft_id, prospect_id, tone? }
  → Returns: { suggestion, confidence, source_signals, timestamp, input_hash }

POST /ai/rewrite
  Body: { draft_id, instruction }
  → Returns: { suggestion, confidence, source_signals, timestamp, input_hash }

POST /ai/score
  Body: { draft_id }
  → Returns: { spam_risk, reply_probability, signals }
```

**Key Points**:

- Editor remains fully interactive
- AI is non-blocking
- Glow System provides visual feedback

---

### 4. AI Orchestrator Execution (Backend)

**State**: `AI = Processing`

**Workflow** (Strictly Bounded):

1. **Fetch Deterministic Inputs**:

   - Draft content from `email_drafts`
   - Prospect data from `prospects`
   - Company metadata from `company_data`
   - User preferences

2. **Build Constrained Prompt**:

   - No new facts allowed
   - Only use provided context
   - Enforce tone/style constraints

3. **Call LLM**:

   - OpenAI GPT-4 API
   - With rate limiting
   - With timeout (30s)

4. **Post-Process Response**:
   - Extract suggested text/diff
   - Calculate confidence score
   - Extract source signals
   - Generate input hash
   - Add timestamp

**Critical Constraints**:

- ❌ No database writes
- ❌ No side effects
- ❌ No queues involved
- ✅ Pure function behavior

**Response Format**:

```typescript
{
  suggestion: {
    subject?: string;
    body?: string;
    diff?: Array<{ type: 'insert' | 'delete' | 'replace', ... }>;
  };
  confidence: number; // 0-1
  source_signals: {
    prospect_match: number;
    company_match: number;
    tone_match: number;
  };
  timestamp: string;
  input_hash: string; // For deduplication
}
```

---

### 5. AI Response & Glow Transition

**State Transition**: `GlowSystem: Thinking → Suggestion Ready`

**Frontend Actions**:

- Store suggestion in ephemeral UI state
- Update Glow System state
- Render suggestion overlay
- Encode confidence via glow intensity
- Show freshness indicator

**Glow System States**:

- `Idle`: No AI activity
- `Thinking`: AI processing
- `Suggestion Ready`: Suggestion available
- `Stale`: Suggestion outdated
- `Applied`: Suggestion accepted

**Visual Encoding**:

- **Glow Intensity** = Confidence score (0-1)
- **Glow Color** = Freshness (green = fresh, yellow = stale)
- **Pulse Rate** = Processing state

**Key Points**:

- Nothing changed yet
- User sees what AI suggests
- User sees confidence level
- User maintains full control

---

### 6. User Decision Point (Human in the Loop)

**State**: `GlowSystem = Suggestion Ready` or `Stale`

**User Options**:

1. **Accept**: Apply suggestion to editor
2. **Edit**: Modify suggestion before applying
3. **Reject**: Dismiss suggestion

**Stale Detection**:

- If user edits draft manually after suggestion:
  - Frontend detects divergence
  - `GlowSystem → Stale`
  - Suggestion visually downgraded
  - Prevents accidental use of outdated output

**Implementation**:

```typescript
// Detect divergence
const isStale = useMemo(() => {
  if (!suggestion) return false;
  const currentHash = hashDraft(currentDraft);
  return currentHash !== suggestion.input_hash;
}, [currentDraft, suggestion]);
```

**Key Points**:

- Nothing happens until user decides
- Stale suggestions are protected
- User maintains full control

---

### 7. Accepting an AI Suggestion (Controlled Persistence)

**State Transition**: `GlowSystem: Suggestion Ready → Applied → Idle`

**Workflow**:

1. Editor applies changes locally
2. Frontend calls `POST /emails/draft`
3. Draft persisted to database
4. Glow System transitions to `Idle`

**API Calls**:

```
POST /emails/draft
  Body: { id, subject, body, prospect_id }

POST /ai/feedback (async, non-blocking)
  Body: { suggestion_id, action: 'accepted' | 'rejected' | 'edited', feedback? }
```

**Key Points**:

- Changes applied locally first
- Persistence is synchronous
- Feedback is asynchronous
- Non-blocking

---

### 8. Pre-Send Validation & Scoring

**State**: `GlowSystem = Idle`

**Optional Call**:

```
POST /ai/score
  Body: { draft_id }
  → Returns: {
      spam_risk: number, // 0-1
      reply_probability: number, // 0-1
      signals: {
        subject_length: number;
        body_length: number;
        link_count: number;
        spam_keywords: string[];
      }
    }
```

**Key Points**:

- Advisory only
- Does not alter content
- User can review before sending
- Non-blocking

---

### 9. User Clicks Send (Intent Becomes a Command)

**State**: `Email = Draft`, `GlowSystem = Idle`

**Actions**:

- Frontend generates idempotency key (UUID)
- Send button disabled
- Request sent to `POST /emails/send`

**API Call**:

```
POST /emails/send
  Body: {
    draft_id: string;
    idempotency_key: string; // UUID
    from_email: string;
    to_email: string;
  }
  Headers: {
    Idempotency-Key: <uuid>
  }
```

**Key Points**:

- AI completely out of loop
- Idempotency key prevents duplicates
- Send button disabled prevents double-clicks

---

### 10. Send API Handling (Backend Determinism)

**State**: `Email = PENDING_SEND`

**Workflow**:

1. **Authenticate** request (JWT)
2. **Validate** workspace ownership
3. **Check** draft not already sent
4. **Verify** idempotency key (check if email already exists)
5. **Create** immutable row in `emails` table
6. **Copy** final draft snapshot
7. **Set** status = `PENDING_SEND`

**Database Write**:

```sql
INSERT INTO emails (
  id, draft_id, user_id, workspace_id,
  from_email, to_email, subject, body_html, body_text,
  status, idempotency_key, created_at
) VALUES (...)
```

**Key Points**:

- Write happens before any side effects
- Email record is immutable
- Idempotency key prevents duplicates
- Status is `PENDING_SEND` (not `SENT`)

---

### 11. Queue Enqueue (Side Effects Deferred)

**State**: `Email = PENDING_SEND`, `Queue = Enqueued`

**Actions**:

- Send job enqueued with `email_id`
- API returns success to client
- User sees "Email sent" confirmation

**Queue Job**:

```typescript
{
  type: 'SEND_EMAIL',
  email_id: string,
  priority: 'high',
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
}
```

**Key Points**:

- From user's perspective, email is "sent"
- UI is correct even if failures happen later
- Side effects are deferred
- Retries are safe

---

### 12. Worker Execution (Actual Email Send)

**State**: `Email = SENT` (after successful send)

**Worker Workflow**:

1. **Load** `emails` record
2. **Verify** state is still `PENDING_SEND`
3. **Get** OAuth connection for `from_email`
4. **Refresh** token if expired
5. **Send** via Gmail/Outlook API
6. **Update** status to `SENT`
7. **Set** `sent_at` timestamp
8. **Emit** `EMAIL_SENT` event

**Provider Call**:

```typescript
// Gmail API
await gmail.users.messages.send({
  userId: "me",
  requestBody: {
    raw: base64EncodedEmail,
  },
});
```

**State Update**:

```sql
UPDATE emails
SET status = 'SENT',
    sent_at = NOW(),
    provider_message_id = ?
WHERE id = ? AND status = 'PENDING_SEND';
```

**Key Points**:

- Retries are safe (idempotent provider calls)
- Email record already exists
- Status check prevents duplicate sends
- Event emitted for analytics

---

### 13. Provider Events → Event Log

**State**: `Email = SENT`, `Events = Appended`

**Webhook Flow**:

1. Provider sends webhook (open/reply/bounce)
2. Webhook validated (signature check)
3. Event mapped to `email_id`
4. Row appended to `email_events`

**Event Log Schema**:

```sql
CREATE TABLE email_events (
  id UUID PRIMARY KEY,
  email_id UUID REFERENCES emails(id),
  event_type VARCHAR(50), -- 'opened', 'replied', 'bounced', 'clicked'
  event_data JSONB,
  provider_event_id VARCHAR(255),
  created_at TIMESTAMP
);
```

**Key Points**:

- No existing rows mutated
- Append-only log
- Events are immutable
- Safe for retries

---

### 14. Analytics & Learning (Async, Non-Blocking)

**State**: `Analytics = Eventually Consistent`

**Consumers**:

1. **Dashboard Aggregator**: Updates campaign stats
2. **Template Performance**: Updates template scores
3. **Learning System**: Feeds ML models
4. **Alert System**: Triggers notifications

**Pipeline**:

```
email_events → Event Stream → Analytics Workers → Aggregated Stats
```

**Key Points**:

- Event-driven
- Eventually consistent
- Isolated from user workflows
- Failures don't affect delivery

---

### 15. Failure Handling (Why This Works)

**Network Retries**:

- Idempotency keys prevent duplicate sends
- Draft saves are safe to retry
- AI calls are idempotent

**Worker Crashes**:

- Email record already exists
- Worker retries from queue
- No user intent lost

**AI Failures**:

- Don't block draft writing
- Don't block sending
- User can continue without AI

**Analytics Failures**:

- Don't affect email delivery
- Events are retried
- Eventually consistent

**Provider Failures**:

- Worker retries with backoff
- Status remains `PENDING_SEND`
- User can see pending status

---

## Database Schema (MVP)

### Core Tables

```sql
-- Drafts (mutable until sent)
email_drafts (
  id UUID PRIMARY KEY,
  user_id UUID,
  workspace_id UUID,
  prospect_id UUID,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Emails (immutable after creation)
emails (
  id UUID PRIMARY KEY,
  draft_id UUID,
  user_id UUID,
  workspace_id UUID,
  from_email VARCHAR(255),
  to_email VARCHAR(255),
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  status VARCHAR(50), -- 'PENDING_SEND', 'SENT', 'FAILED', 'BOUNCED'
  idempotency_key UUID UNIQUE,
  provider_message_id VARCHAR(255),
  sent_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Event Log (append-only)
email_events (
  id UUID PRIMARY KEY,
  email_id UUID REFERENCES emails(id),
  event_type VARCHAR(50), -- 'opened', 'replied', 'bounced', 'clicked'
  event_data JSONB,
  provider_event_id VARCHAR(255),
  created_at TIMESTAMP
);

-- Prospects
prospects (
  id UUID PRIMARY KEY,
  workspace_id UUID,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  job_title VARCHAR(255),
  custom_fields JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Company Data (for personalization)
company_data (
  id UUID PRIMARY KEY,
  domain VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  location VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## API Endpoints (MVP)

### Draft Management

```
GET    /emails/drafts/:id
POST   /emails/draft
PUT    /emails/draft/:id
DELETE /emails/draft/:id
```

### AI Operations

```
POST   /ai/personalize
POST   /ai/rewrite
POST   /ai/score
POST   /ai/feedback
```

### Email Sending

```
POST   /emails/send
GET    /emails/:id
GET    /emails/:id/events
```

### Prospects

```
GET    /prospects
GET    /prospects/:id
POST   /prospects
PUT    /prospects/:id
```

---

## Glow System Specification

### States

- `Idle`: No AI activity
- `Thinking`: AI processing request
- `Suggestion Ready`: Suggestion available
- `Stale`: Suggestion outdated
- `Applied`: Suggestion accepted

### Visual Encoding

- **Intensity**: Confidence score (0-1) → opacity (0.3-1.0)
- **Color**:
  - Green: Fresh suggestion
  - Yellow: Stale suggestion
  - Blue: Processing
- **Pulse**: Active during `Thinking` state

### Implementation

```typescript
interface GlowState {
  state: "idle" | "thinking" | "suggestion_ready" | "stale" | "applied";
  confidence?: number;
  freshness?: number; // 0-1, based on time since generation
}
```

---

## Out of Scope for MVP

The following features are **intentionally excluded** from MVP:

- ❌ Sequences and automated follow-ups
- ❌ Campaigns and bulk sends
- ❌ Cohort and funnel analytics
- ❌ CRM integrations
- ❌ Team collaboration and approvals
- ❌ Mobile applications
- ❌ Billing and subscriptions
- ❌ Enterprise compliance tooling
- ❌ Autonomous AI actions

These will be introduced incrementally in later phases once the core **draft → send → analytics** loop is proven reliable and trustworthy.

---

## Success Metrics

### User Experience

- **Typing Latency**: < 16ms (60fps)
- **Draft Save Latency**: < 100ms (debounced)
- **AI Response Time**: < 3s (95th percentile)
- **Send Confirmation**: < 200ms

### Reliability

- **Draft Persistence**: 99.9% success rate
- **Send Success**: 99.5% success rate
- **AI Availability**: 99% uptime
- **Event Processing**: 99.9% eventual consistency

### Performance

- **API Response**: < 500ms (95th percentile)
- **Database Queries**: < 100ms (95th percentile)
- **Worker Processing**: < 5s per email

---

_Last Updated: [Current Date]_
_Version: 1.0 - MVP Focus_
