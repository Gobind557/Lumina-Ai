# AI Sales Email Copilot - System Design Document

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Design Constraints](#design-constraints)
3. [System Components](#system-components)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Sequence Diagrams](#sequence-diagrams)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [API Design Patterns](#api-design-patterns)

---

## System Requirements

### Functional Requirements

#### Phase 1 (MVP)
- User registration and authentication
- Gmail OAuth integration
- Email composition with rich text editor
- Template library (20 pre-built templates)
- AI email generation (GPT-4)
- Email improvement suggestions
- Tone adjustment
- Subject line generation
- Grammar & spell check
- Send email via Gmail API
- Save as draft
- Variable replacement ({{firstName}}, {{company}})
- Email tracking (open tracking pixel)
- Basic analytics (sent, opened)
- Email preview (desktop/mobile)

#### Phase 2 (Automation)
- Multi-step sequence builder (up to 5 steps)
- Drag-and-drop sequence builder
- Delay configuration (days/hours)
- Conditional logic (if no reply, if opened)
- Pre-built sequence templates
- Lead import (CSV upload)
- Manual lead entry
- Campaign creation
- Auto-send scheduler
- Reply detection (stop sequence on reply)
- Campaign dashboard
- Lead status tracking

#### Phase 3 (Personalization)
- Company lookup by domain
- Auto-fetch company data (size, industry, location)
- Recent news fetching
- Tech stack detection
- LinkedIn profile scraping
- Smart icebreaker generation
- Pain point detection

#### Phase 4 (Analytics)
- Campaign performance dashboard
- Open rate by template, time, day
- Reply rate tracking
- Click tracking
- Conversion tracking
- Template performance leaderboard
- Export reports (PDF, CSV)
- A/B test results
- Winning template recommendations
- Send time optimizer
- Subject line performance
- Email length optimizer
- Spam score checker

#### Phase 5 (Teams)
- Team workspace
- Invite team members
- Role-based access (admin, member, viewer)
- Shared template library
- Team performance dashboard
- Activity feed
- Template approval workflow
- Comments on drafts
- Shared lead pool
- Lead assignment
- Team sequences
- Manager analytics
- AI coaching
- Best practices library

#### Phase 6 (Integrations)
- Salesforce integration
- HubSpot integration
- Pipedrive integration
- Two-way sync
- Outlook integration
- Calendly/Cal.com integration
- Slack notifications
- Zapier integration
- Webhook API

#### Phase 7 (Mobile & Extensions)
- Chrome extension
- Gmail integration
- LinkedIn → Email (one click)
- Quick template access
- AI suggestions in Gmail
- Track emails from Gmail
- iOS & Android apps
- Voice-to-email
- Push notifications
- Mobile analytics
- Offline mode

#### Phase 8 (Enterprise)
- Custom AI training
- Industry-specific models
- White label option
- Custom domain
- SSO (Single Sign-On)
- Advanced permissions
- Audit logs
- Data export
- GDPR compliance tools
- Email warmup system
- Multi-account rotation
- Deliverability optimization
- Bulk operations (1000+ leads)
- Advanced scheduling
- Rate limiting
- Email verification
- Bounce handling

### Non-Functional Requirements

#### Performance
- API response time: <500ms (95th percentile)
- Page load time: <2s
- Email send time: <5s (queue to sent)
- Support 10,000+ concurrent users
- Handle 1M+ emails/month

#### Scalability
- Horizontal scaling capability
- Auto-scaling based on load
- Support 100,000+ users
- Handle 10M+ emails/month

#### Reliability
- 99.9% uptime SLA
- Automatic failover
- Data backup and recovery
- RTO: 4 hours, RPO: 1 hour

#### Security
- SOC 2 compliance
- GDPR compliance
- Data encryption at rest and in transit
- Secure token storage
- Rate limiting
- DDoS protection

#### Usability
- Intuitive UI/UX
- Mobile responsive
- Accessible (WCAG 2.1 AA)
- Multi-language support (future)

---

## Design Constraints

### Technical Constraints
- Must use Gmail API for Gmail integration
- Must use Microsoft Graph API for Outlook
- OpenAI API rate limits
- Email provider rate limits
- Database connection limits

### Business Constraints
- Cost-effective infrastructure
- Quick time-to-market
- Scalable pricing model
- Compliance requirements

### Regulatory Constraints
- GDPR (EU users)
- CAN-SPAM Act (US)
- Email marketing regulations
- Data privacy laws

---

## System Components

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Application                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Auth        │  │   Dashboard  │  │   Composer   ││
│  │   Module      │  │   Module     │  │   Module     ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Campaign   │  │   Sequence   │  │   Analytics  ││
│  │   Module     │  │   Module     │  │   Module     ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   Template   │  │   Team       │  │   Settings   ││
│  │   Module     │  │   Module     │  │   Module      ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │           Shared Components & Utilities             ││
│  │  - API Client  - State Management  - UI Components ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│  - Authentication  - Rate Limiting  - Request Routing   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   Auth       │  │   Email       │  │   Campaign   │
│   Service    │  │   Service     │  │   Service    │
└──────────────┘  └───────────────┘  └──────────────┘
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   AI         │  │   Analytics   │  │   Sequence   │
│   Service    │  │   Service     │  │   Service    │
└──────────────┘  └───────────────┘  └──────────────┘
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ Integration  │  │   Team       │  │   Template   │
│   Service    │  │   Service    │  │   Service    │
└──────────────┘  └───────────────┘  └──────────────┘
```

### Worker Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Background Workers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Email Queue Worker                         │ │
│  │  - Process email send queue                        │ │
│  │  - Handle retries                                  │ │
│  │  - Update email status                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Sequence Worker                            │ │
│  │  - Execute sequence steps                          │ │
│  │  - Calculate delays                                │ │
│  │  - Evaluate conditions                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Analytics Worker                           │ │
│  │  - Process tracking events                         │ │
│  │  - Calculate metrics                               │ │
│  │  - Generate reports                                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Webhook Worker                             │ │
│  │  - Deliver webhooks                               │ │
│  │  - Handle retries                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Email Warmup Worker                        │ │
│  │  - Gradual email volume increase                   │ │
│  │  - Reputation building                             │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Email Send Flow

```
User Action
    │
    ▼
Frontend (Composer)
    │
    ▼
API Gateway (Auth Check)
    │
    ▼
Email Service
    │
    ├──► Validate Email
    ├──► Replace Variables
    ├──► Generate Tracking Pixel
    └──► Queue Email Job
            │
            ▼
        Email Queue (Redis/BullMQ)
            │
            ▼
        Email Worker
            │
            ├──► Get OAuth Token
            ├──► Refresh if Expired
            └──► Send via Gmail/Outlook API
                    │
                    ├──► Success → Update DB
                    │              └──► Track Event
                    │
                    └──► Failure → Retry Logic
                                  └──► Max Retries → Mark Failed
```

### AI Email Generation Flow

```
User Request
    │
    ▼
Frontend (Composer)
    │
    ▼
API Gateway
    │
    ▼
AI Service
    │
    ├──► Validate Request
    ├──► Check Rate Limits
    ├──► Build Prompt
    │       │
    │       ├──► User Context
    │       ├──► Template Context
    │       └──► Lead Data
    │
    └──► Call OpenAI API
            │
            ├──► Success → Return Generated Email
            │              └──► Cache Result
            │
            └──► Failure → Retry or Return Error
```

### Campaign Execution Flow

```
Campaign Start
    │
    ▼
Campaign Service
    │
    ├──► Validate Campaign
    ├──► Get Sequence Steps
    ├──► Get Leads
    └──► For Each Lead:
            │
            ├──► Create Lead Record
            ├──► Queue First Step
            └──► Update Campaign Stats
                    │
                    ▼
                Sequence Worker
                    │
                    ├──► Check Delay
                    ├──► Evaluate Conditions
                    ├──► Get Template
                    ├──► Replace Variables
                    └──► Queue Email Send
                            │
                            ▼
                        Email Worker
                            │
                            └──► Send Email
                                    │
                                    ▼
                                Track Event
                                    │
                                    ▼
                                Check for Next Step
                                    │
                                    └──► Queue Next Step (if conditions met)
```

### Email Tracking Flow

```
Email Opened
    │
    ▼
Tracking Pixel Request
    │
    ▼
Analytics Service
    │
    ├──► Extract Tracking ID
    ├──► Validate Request
    ├──► Update Email Record (opened_at)
    ├──► Update Lead Status
    ├──► Update Campaign Stats
    └──► Queue Analytics Event
            │
            ▼
        Analytics Worker
            │
            ├──► Calculate Metrics
            ├──► Update Dashboard Cache
            └──► Trigger Webhooks (if configured)
```

---

## Sequence Diagrams

### User Registration & Gmail Connection

```
User          Frontend        API Gateway      Auth Service    Gmail API
 │                │                │                │              │
 │──Register─────►│                │                │              │
 │                │──POST /auth/register───────────►│              │
 │                │                │                │              │
 │                │                │◄──User Created─│              │
 │                │◄──JWT Token────│                │              │
 │◄──Logged In────│                │                │              │
 │                │                │                │              │
 │──Connect Gmail►│                │                │              │
 │                │──GET /oauth/gmail/authorize────►│              │
 │                │                │                │              │
 │                │                │──OAuth URL─────┼─────────────►│
 │                │                │                │              │
 │                │◄──Redirect URL─│                │              │
 │◄──Redirect─────│                │                │              │
 │                │                │                │              │
 │──OAuth Callback►│                │                │              │
 │                │──GET /oauth/gmail/callback─────►│              │
 │                │                │                │              │
 │                │                │──Exchange Code─┼─────────────►│
 │                │                │                │              │
 │                │                │◄──Tokens───────┼──────────────│
 │                │                │                │              │
 │                │                │──Save Tokens───►│              │
 │                │                │                │              │
 │                │◄──Success──────│                │              │
 │◄──Connected────│                │                │              │
```

### AI Email Generation

```
User          Frontend        API Gateway      AI Service      OpenAI API
 │                │                │                │              │
 │──Generate──────►│                │                │              │
 │                │──POST /ai/generate-email───────►│              │
 │                │                │                │              │
 │                │                │──Check Cache───┼──────────────│
 │                │                │                │              │
 │                │                │──Build Prompt─►│              │
 │                │                │                │              │
 │                │                │                │──GPT-4 Call─►│
 │                │                │                │              │
 │                │                │                │◄──Response───│
 │                │                │                │              │
 │                │                │──Cache Result─►│              │
 │                │                │                │              │
 │                │◄──Generated Email───────────────│              │
 │◄──Email────────│                │                │              │
```

### Campaign Execution with Sequence

```
User          Frontend        Campaign Service  Sequence Worker  Email Worker
 │                │                │                │              │
 │──Start Campaign►│                │                │              │
 │                │──POST /campaigns/:id/start─────►│              │
 │                │                │                │              │
 │                │                │──Get Sequence──┼──────────────│
 │                │                │──Get Leads─────┼──────────────│
 │                │                │                │              │
 │                │                │──Queue Step 1──┼─────────────►│
 │                │                │                │              │
 │                │◄──Campaign Started──────────────│              │
 │                │                │                │              │
 │                │                │                │──Process Step│
 │                │                │                │              │
 │                │                │                │──Queue Email─┼──►│
 │                │                │                │              │  │
 │                │                │                │              │──Send│
 │                │                │                │              │  │
 │                │                │                │              │◄──Sent│
 │                │                │                │              │
 │                │                │──Update Stats──┼──────────────│
 │                │                │                │              │
 │                │                │                │──Schedule Step 2│
 │                │                │                │              │
 │                │                │                │              │
 │                │                │                │──(After Delay)│
 │                │                │                │              │
 │                │                │                │──Check Conditions│
 │                │                │                │              │
 │                │                │                │──Queue Step 2─┼──►│
```

---

## State Management

### Frontend State Structure

```typescript
// Global State (Zustand/Redux)
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    oauthConnections: OAuthConnection[]
  },
  campaigns: {
    items: Campaign[],
    current: Campaign | null,
    loading: boolean,
    filters: CampaignFilters
  },
  templates: {
    items: Template[],
    current: Template | null,
    categories: Category[],
    loading: boolean
  },
  sequences: {
    items: Sequence[],
    current: Sequence | null,
    loading: boolean
  },
  leads: {
    items: Lead[],
    current: Lead | null,
    loading: boolean,
    filters: LeadFilters
  },
  analytics: {
    dashboard: DashboardStats,
    campaignStats: CampaignStats | null,
    loading: boolean
  },
  team: {
    currentTeam: Team | null,
    members: TeamMember[],
    loading: boolean
  },
  ui: {
    sidebarOpen: boolean,
    notifications: Notification[],
    modals: ModalState
  }
}
```

### Backend State Management

- **Stateless Services**: All services are stateless
- **Session State**: Stored in Redis
- **Job State**: Managed by BullMQ
- **Cache State**: Redis for frequently accessed data

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "uuid"
  }
}
```

### Error Categories

1. **Authentication Errors** (401)
   - Invalid token
   - Token expired
   - OAuth connection failed

2. **Authorization Errors** (403)
   - Insufficient permissions
   - Team access denied

3. **Validation Errors** (400)
   - Invalid input
   - Missing required fields
   - Invalid email format

4. **Not Found Errors** (404)
   - Resource not found
   - Invalid ID

5. **Rate Limit Errors** (429)
   - Too many requests
   - API quota exceeded

6. **Server Errors** (500)
   - Internal server error
   - Database error
   - External API failure

### Retry Strategy

- **Exponential Backoff**: For transient failures
- **Max Retries**: 3 attempts for email sends
- **Dead Letter Queue**: For permanently failed jobs
- **Circuit Breaker**: For external API calls

---

## API Design Patterns

### RESTful Principles
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Status codes
- JSON responses

### Pagination
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Filtering & Sorting
```
GET /campaigns?status=active&sort=created_at&order=desc
```

### Bulk Operations
```
POST /campaigns/bulk
{
  "action": "pause",
  "ids": ["id1", "id2", "id3"]
}
```

### Webhooks
```json
{
  "event": "email.opened",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "emailId": "uuid",
    "campaignId": "uuid",
    "leadId": "uuid"
  }
}
```

---

*Last Updated: [Current Date]*
*Version: 1.0*

