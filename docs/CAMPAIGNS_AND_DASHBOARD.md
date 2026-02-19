# Campaigns & Dynamic Dashboard Guide

## How Campaigns Work Now

### Campaign Lifecycle

1. **Campaign Created** → Status: `DRAFT`
   - User creates campaign via API
   - Campaign is inactive, no emails sent yet

2. **First Email Queued** → Status: `DRAFT` → `ACTIVE` (auto)
   - When an email is created with `campaignId`, it's queued
   - Campaign consumer detects `EMAIL_QUEUED` event
   - Auto-activates campaign if status is `DRAFT`

3. **Emails Sent** → Campaign remains `ACTIVE`
   - Worker sends emails via SMTP
   - `EMAIL_SENT` event published
   - Campaign consumer ensures campaign stays `ACTIVE`

4. **End Date Reached** → Status: `ACTIVE` → `COMPLETED` (auto)
   - Campaign consumer checks `endDate` on `EMAIL_SENT`
   - Auto-completes campaign if end date passed

5. **Manual Control** → Can set to `PAUSED` or `ARCHIVED`
   - User can pause/archive campaigns via API

### Campaign Events Flow

```
Email Created (with campaignId)
  ↓
EMAIL_QUEUED event → Campaign Consumer
  ↓
Campaign auto-activated (DRAFT → ACTIVE)
  ↓
Email Worker sends email
  ↓
EMAIL_SENT event → Campaign Consumer
  ↓
Campaign checked for completion
  ↓
EMAIL_OPENED/EMAIL_REPLIED → Analytics Consumer
  ↓
Metrics updated in real-time
```

### Campaign Status States

- **DRAFT**: Campaign created but no emails sent
- **ACTIVE**: Campaign running, emails being sent
- **PAUSED**: Campaign paused by user
- **COMPLETED**: Campaign finished (end date reached or manually completed)
- **ARCHIVED**: Campaign archived

---

## Making Dashboard Dynamic

### Current State
- Dashboard components use **hardcoded/mock data**
- No API integration
- No real-time updates

### Implementation Plan

#### 1. Create Dashboard API Endpoints

**Backend:** `backend/api/src/modules/dashboard/dashboard.controller.ts`
- `GET /api/dashboard/stats` - Overall metrics
- `GET /api/dashboard/timeline` - Recent email activity
- `GET /api/dashboard/momentum` - Recent opens/replies
- `GET /api/dashboard/campaigns` - Active campaigns summary

#### 2. Create Dashboard Service

**Backend:** `backend/api/src/modules/dashboard/dashboard.service.ts`
- Aggregates data from emails, opens, replies, campaigns
- Computes metrics (open rates, reply rates, etc.)
- Returns formatted data for frontend

#### 3. Create Frontend API Client

**Frontend:** `frontend/src/features/dashboard/api/dashboard.api.ts`
- Functions to fetch dashboard data
- Uses shared `apiRequest` client

#### 4. Create Dashboard Hooks

**Frontend:** `frontend/src/features/dashboard/hooks/useDashboard.ts`
- React hooks for dashboard data
- Handles loading states
- Optional: Real-time updates via polling or WebSocket

#### 5. Update Dashboard Components

Replace hardcoded data with:
- `useDashboard()` hook calls
- Loading states
- Error handling
- Real data from API

---

## Next Steps

1. ✅ Campaigns working (auto-progression implemented)
2. ⏳ Create dashboard API endpoints
3. ⏳ Create dashboard service (aggregate data)
4. ⏳ Create frontend API client
5. ⏳ Create dashboard hooks
6. ⏳ Update components to use real data
