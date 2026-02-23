# Dashboard Real-Time Data & React Query Migration Plan

## Overview

1. **Migrate to React Query** — Replace manual `useState`/`useEffect` + `setInterval` in dashboard hooks with `useQuery` and `refetchInterval` (polling).
2. **Wire components to real API** — LiveConversationTimeline, ActionCenter, TopBanner use hooks; BestTimeCard and WhatToDoNextCard remain static until backend support exists.

---

## Phase 1: React Query Setup (Short-Term Polling)

### 1.1 Install & Provider

- Install `@tanstack/react-query`.
- Update `QueryProvider` to create `QueryClient` and wrap app with `QueryClientProvider`.
- Defaults: `refetchOnWindowFocus: true`, `staleTime: 60_000` (optional).

### 1.2 Migrate Dashboard Hooks (`useDashboard.ts`)


| Hook                         | Query key                         | refetchInterval | Notes                             |
| ---------------------------- | --------------------------------- | --------------- | --------------------------------- |
| `useDashboardStats`          | `['dashboard', 'stats']`          | 30s             | Shared by TopBanner, ActionCenter |
| `useDashboardTimeline(days)` | `['dashboard', 'timeline', days]` | 30s             | Used by LiveConversationTimeline  |
| `useDashboardMomentum`       | `['dashboard', 'momentum']`       | 15s             | Already used by MomentumCard      |
| `useDashboardCampaigns`      | `['dashboard', 'campaigns']`      | 30s             | For future use                    |


**Return shape:** Keep `{ data, loading, error, refetch }` (or `stats`/`timeline`/`momentum` as aliases for `data`) so existing components need minimal changes.

**Benefits:**

- Single source of truth; multiple components using the same query key share one request and cache.
- Automatic deduplication, background refetch, and cleanup when components unmount.
- Polling via `refetchInterval` replaces manual `setInterval`.

---

## Phase 2: Component Updates

### 2.1 LiveConversationTimeline

- **Data:** `useDashboardTimeline(7)`.
- **Chart:** Map `timeline.timeline` to Recharts: `day` (or short label) on X-axis, `opens` (blue line), `replies` (purple line).
- **Recent emails:** List first 5–10 from `timeline.emails` (subject, prospectName, sentAt).
- **UI:** Loading skeleton, empty state when no data, keep tabs (Today / Replies / Closed) — filter client-side if needed.

### 2.2 ActionCenter

- **Data:** `useDashboardStats()`.
- **Readiness:** Derive from engagement, e.g. `openRate` or `(openRate * 0.6 + replyRate * 0.4)`.
- **Reply Likelihood:** `stats.engagement.replyRate`.
- **Spam Risk:** No API; keep placeholder (e.g. "~5%" or "Low").
- **UI:** Loading state (skeleton or spinner).

### 2.3 TopBanner

- **Data:** `useDashboardStats()`.
- **Content:** Show real metrics: e.g. "X emails sent today · Y opens · Z replies" (from `stats.emails.today`, `stats.engagement.opens.today`, `stats.engagement.replies.today`).
- **UI:** Optional insight line (e.g. "Emails sent Tue 9–11am had 41% higher replies") can stay as static tip or be removed; show loading skeleton when fetching.

### 2.4 BestTimeCard

- **Decision:** No backend for “best time to send” yet. Keep **static** content (e.g. “Tue 9am”, “+32.6%”).
- **Later:** When an endpoint or derived metric exists, switch to `useDashboardStats()` or a dedicated `useBestTime()` hook.

### 2.5 WhatToDoNextCard

- **Decision:** No backend for “next actions” yet. Keep **static** list.
- **Optional:** Use `useDashboardStats()` to show context (e.g. “Based on X% reply rate”) without changing the list.
- **Later:** When action-recommendation API exists, add a dedicated hook and wire the list.

---

## Phase 3: Real-Time Beyond Polling (Future)

- **Short term (current):** React Query polling every 15–30s.
- **Later options:** WebSockets or Server-Sent Events for live updates (e.g. new opens/replies), then invalidate relevant query keys or push new data into the cache.

---

## File Checklist

- `frontend/package.json` — add `@tanstack/react-query`
- `frontend/src/core/providers/QueryProvider.tsx` — QueryClient + QueryClientProvider
- `frontend/src/features/dashboard/hooks/useDashboard.ts` — useQuery + refetchInterval
- `frontend/src/features/dashboard/components/LiveConversationTimeline.tsx` — useDashboardTimeline(7), chart + emails
- `frontend/src/features/dashboard/components/ActionCenter.tsx` — useDashboardStats(), readiness + reply rate
- `frontend/src/features/dashboard/components/TopBanner.tsx` — useDashboardStats(), real metrics
- BestTimeCard / WhatToDoNextCard — left static with inline comments; see plan for future API

