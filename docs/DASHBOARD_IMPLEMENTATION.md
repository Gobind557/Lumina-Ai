# Dashboard Dynamic Implementation Guide

## ✅ What's Been Implemented

### Backend API Endpoints

1. **`GET /api/dashboard/stats`**
   - Overall metrics: email counts, open/reply rates, active campaigns
   - Returns: `{ emails, engagement, campaigns }`

2. **`GET /api/dashboard/timeline`**
   - Recent email activity (last 7 days by default)
   - Returns: `{ emails[], timeline[] }` with daily opens/replies

3. **`GET /api/dashboard/momentum`**
   - Recent opens and replies (last 10 of each)
   - Returns: `{ opens[], replies[] }` with prospect info and timestamps

4. **`GET /api/dashboard/campaigns`**
   - Active campaigns summary with metrics
   - Returns: `CampaignSummary[]` with open/reply rates

### Frontend Hooks

- `useDashboardStats()` - Overall stats (auto-refresh every 30s)
- `useDashboardTimeline(days)` - Timeline data (auto-refresh every 30s)
- `useDashboardMomentum()` - Recent activity (auto-refresh every 15s)
- `useDashboardCampaigns()` - Campaign summaries (auto-refresh every 30s)

### Example Component Update

**MomentumCard** has been updated to use real data:
- Fetches from `useDashboardMomentum()` hook
- Shows loading state
- Displays real opens/replies
- Auto-refreshes every 15 seconds

---

## 🔄 How to Update Other Components

### 1. LiveConversationTimeline

```tsx
import { useDashboardTimeline } from '../hooks/useDashboard'

export default function LiveConversationTimeline() {
  const { timeline, loading } = useDashboardTimeline(7)
  
  // Use timeline.timeline for chart data
  // Use timeline.emails for recent emails list
}
```

### 2. ActionCenter

```tsx
import { useDashboardStats } from '../hooks/useDashboard'

export default function ActionCenter() {
  const { stats, loading } = useDashboardStats()
  
  // Use stats.engagement.openRate for readiness
  // Use stats.engagement.replyRate for reply likelihood
}
```

### 3. TopBanner

```tsx
import { useDashboardStats } from '../hooks/useDashboard'

export default function TopBanner() {
  const { stats } = useDashboardStats()
  
  // Display stats.emails.today, stats.engagement.opens.today, etc.
}
```

---

## 📊 Data Flow

```
Dashboard Component
  ↓
useDashboard* Hook
  ↓
dashboardApi.*
  ↓
GET /api/dashboard/*
  ↓
dashboard.service.*
  ↓
Prisma Queries (Email, EmailOpenEvent, EmailReplyEvent, Campaign)
  ↓
Real-time Data
```

---

## 🚀 Next Steps

1. ✅ Backend API endpoints created
2. ✅ Frontend hooks created
3. ✅ MomentumCard updated (example)
4. ⏳ Update LiveConversationTimeline
5. ⏳ Update ActionCenter
6. ⏳ Update TopBanner
7. ⏳ Update BestTimeCard (if needed)
8. ⏳ Update WhatToDoNextCard (if needed)

---

## 💡 Real-time Updates

All hooks auto-refresh:
- **Momentum**: Every 15 seconds (most frequent)
- **Stats/Timeline/Campaigns**: Every 30 seconds

For true real-time, consider:
- WebSocket connection
- Server-Sent Events (SSE)
- React Query with polling
