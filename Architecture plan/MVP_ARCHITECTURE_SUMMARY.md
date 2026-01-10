# Lumina AI Sales Copilot - MVP Architecture Summary

## Overview

This document summarizes the **MVP architecture** for Lumina AI Sales Copilot, focusing on the core **draft → send → analytics** loop with AI assistance.

---

## Core Design Philosophy

### 1. **Local-First Editing**
- User never waits on backend to type
- Editor state lives in React (instant feedback)
- Draft persistence is debounced and non-blocking
- Idempotent writes ensure safety

### 2. **AI as Pure Function**
- AI operations never write to database
- AI operations never trigger side effects
- AI returns suggestions, not commands
- All AI calls are idempotent and cacheable

### 3. **Human-in-the-Loop**
- AI suggestions are always optional
- User must explicitly accept suggestions
- Manual edits invalidate stale suggestions
- Glow System provides visual feedback

### 4. **Deterministic Send Flow**
- Send intent persisted before side effects
- Idempotency keys prevent duplicates
- Worker failures don't lose user intent
- Email record is immutable after creation

### 5. **Event-Driven Analytics**
- All events append to log (no mutations)
- Analytics are eventually consistent
- Failures don't affect core functionality
- Learning systems consume events asynchronously

---

## Architecture Layers

### Frontend Layer
```
┌─────────────────────────────────────┐
│      React Application              │
├─────────────────────────────────────┤
│  • Editor (Local State)             │
│  • Glow System (AI State)           │
│  • Draft Manager (Debounced Save)   │
│  • AI Suggestion UI                 │
└─────────────────────────────────────┘
```

**Key Components**:
- **Email Composer**: Rich text editor with local state
- **Glow System**: Visual AI state indicator
- **Draft Manager**: Debounced persistence
- **AI Panel**: Suggestion display and controls

### API Layer
```
┌─────────────────────────────────────┐
│      REST API (Express)              │
├─────────────────────────────────────┤
│  • Draft Endpoints                  │
│  • AI Endpoints (Pure Functions)    │
│  • Send Endpoint (Idempotent)        │
│  • Event Endpoints                  │
└─────────────────────────────────────┘
```

**Key Endpoints**:
- `POST /emails/draft` - Idempotent draft save
- `POST /ai/personalize` - AI suggestion (no side effects)
- `POST /emails/send` - Idempotent send with key
- `GET /emails/:id/events` - Event log query

### Worker Layer
```
┌─────────────────────────────────────┐
│      Background Workers              │
├─────────────────────────────────────┤
│  • Email Send Worker                │
│  • Event Processor                  │
│  • Analytics Aggregator             │
└─────────────────────────────────────┘
```

**Key Workers**:
- **Email Send Worker**: Processes `PENDING_SEND` emails
- **Event Processor**: Handles webhook events
- **Analytics Aggregator**: Updates dashboards (async)

### Data Layer
```
┌─────────────────────────────────────┐
│      PostgreSQL + Redis              │
├─────────────────────────────────────┤
│  • email_drafts (mutable)           │
│  • emails (immutable)               │
│  • email_events (append-only)       │
│  • prospects, company_data           │
└─────────────────────────────────────┘
```

**Key Tables**:
- `email_drafts` - Mutable until sent
- `emails` - Immutable after creation
- `email_events` - Append-only event log
- `prospects` - Prospect data
- `company_data` - Company metadata

---

## Data Flow

### Draft Editing Flow
```
User Types → Local State → Debounced Save → POST /emails/draft → DB
     ↑                                                              │
     └──────────────────────────────────────────────────────────────┘
                    (No blocking, instant feedback)
```

### AI Suggestion Flow
```
User Clicks "Personalize" → POST /ai/personalize → LLM Call → Suggestion
     ↑                                                                    │
     └────────────────────────────────────────────────────────────────────┘
                    (Pure function, no DB writes)
```

### Send Flow
```
User Clicks Send → POST /emails/send (idempotency key) → DB Write → Queue
                                                                    │
                                                                    ▼
                                                              Worker → Provider
```

### Event Flow
```
Provider Webhook → Validate → Append to email_events → Analytics Workers
                                                              │
                                                              ▼
                                                        Dashboard Updates
```

---

## Database Schema (MVP)

### Core Tables

**email_drafts** (Mutable)
- Stores draft content
- Updated frequently (debounced)
- Deleted after send

**emails** (Immutable)
- Created when user clicks send
- Status: `PENDING_SEND` → `SENT` → `FAILED`/`BOUNCED`
- Never updated after creation (except status)

**email_events** (Append-Only)
- All events (opens, replies, bounces)
- Never mutated
- Used for analytics

**prospects** (Mutable)
- Prospect information
- Linked to drafts/emails

**company_data** (Mutable)
- Company metadata
- Used for AI personalization

---

## API Design

### Draft Management
- `GET /emails/drafts/:id` - Fetch draft
- `POST /emails/draft` - Create/update (idempotent)
- `DELETE /emails/draft/:id` - Delete draft

### AI Operations
- `POST /ai/personalize` - Get personalized suggestion
- `POST /ai/rewrite` - Get rewritten suggestion
- `POST /ai/score` - Get spam/reply scores
- `POST /ai/feedback` - Submit feedback (async)

### Email Sending
- `POST /emails/send` - Send email (idempotent with key)
- `GET /emails/:id` - Get email status
- `GET /emails/:id/events` - Get event log

### Prospects
- `GET /prospects` - List prospects
- `GET /prospects/:id` - Get prospect
- `POST /prospects` - Create prospect
- `PUT /prospects/:id` - Update prospect

---

## Glow System

### States
- **Idle**: No AI activity
- **Thinking**: AI processing
- **Suggestion Ready**: Suggestion available
- **Stale**: Suggestion outdated
- **Applied**: Suggestion accepted

### Visual Encoding
- **Intensity**: Confidence score (0-1) → opacity
- **Color**: Green (fresh), Yellow (stale), Blue (processing)
- **Pulse**: Active during `Thinking` state

---

## Error Handling

### Network Failures
- Draft saves: Retry with same data (idempotent)
- AI calls: Retry with same input (idempotent)
- Send: Idempotency key prevents duplicates

### Worker Failures
- Email record exists before worker runs
- Worker retries from queue
- No user intent lost

### AI Failures
- Don't block draft writing
- Don't block sending
- User can continue without AI

### Analytics Failures
- Don't affect email delivery
- Events are retried
- Eventually consistent

---

## Performance Targets

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

## Out of Scope (MVP)

The following are **intentionally excluded** from MVP:

- ❌ Sequences and automated follow-ups
- ❌ Campaigns and bulk sends
- ❌ Cohort and funnel analytics
- ❌ CRM integrations
- ❌ Team collaboration and approvals
- ❌ Mobile applications
- ❌ Billing and subscriptions
- ❌ Enterprise compliance tooling
- ❌ Autonomous AI actions

These will be introduced in later phases once the core loop is proven.

---

## Key Files

- **[LUMINA_FLOW.md](./LUMINA_FLOW.md)** - Complete end-to-end flow
- **[API_ENDPOINTS_MVP.md](./API_ENDPOINTS_MVP.md)** - API specification
- **[DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql)** - Database schema (includes MVP tables)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Full architecture (all phases)

---

## Next Steps

1. **Set up project structure** (monorepo)
2. **Initialize database** with MVP schema
3. **Implement draft management** (local-first)
4. **Implement AI endpoints** (pure functions)
5. **Implement send flow** (idempotent)
6. **Implement Glow System** (UI state)
7. **Set up workers** (email send, events)
8. **Add analytics** (event-driven)

---

*Last Updated: [Current Date]*
*Version: 1.0 - MVP Focus*

