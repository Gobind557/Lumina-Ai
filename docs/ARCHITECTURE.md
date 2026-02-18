# AI Sales Email Copilot - Architecture Plan

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Architecture](#component-architecture)
5. [Database Design](#database-design)
6. [API Architecture](#api-architecture)
7. [Third-Party Integrations](#third-party-integrations)
8. [Security Architecture](#security-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Core Purpose

AI-powered sales email automation platform that helps sales teams create, send, and track personalized email campaigns at scale.

### Key Capabilities

- AI-powered email generation and optimization
- Gmail/Outlook integration for sending
- Automated email sequences
- Lead management and campaign tracking
- Team collaboration features
- CRM integrations
- Advanced analytics and reporting

### System Requirements

- **Scalability**: Handle 10,000+ users, 1M+ emails/month
- **Reliability**: 99.9% uptime
- **Security**: SOC 2 compliant, GDPR ready
- **Performance**: <2s page load, <500ms API response

---

## Technology Stack

### Frontend

- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) or Tailwind CSS + shadcn/ui
- **State Management**: Zustand or Redux Toolkit
- **Routing**: React Router v6
- **Rich Text Editor**: Lexical or TipTap
- **Charts/Analytics**: Recharts or Chart.js
- **Email Preview**: React Email
- **Mobile**: React Native (iOS/Android)

### Backend

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js or Fastify
- **API Style**: RESTful + GraphQL (optional)
- **Authentication**: JWT + OAuth 2.0
- **Background Jobs**: BullMQ with Redis
- **Email Queue**: BullMQ
- **WebSockets**: Socket.io (real-time updates)

### Database

- **Primary DB**: PostgreSQL 15+ (user data, campaigns, templates)
- **Cache**: Redis 7+ (sessions, rate limiting, job queues)
- **Search**: Elasticsearch or Algolia (email search, lead search)
- **File Storage**: AWS S3 or Cloudflare R2 (attachments, exports)

### AI/ML

- **Primary**: OpenAI GPT-4 API
- **Embeddings**: OpenAI text-embedding-3
- **Vector DB**: Pinecone or Weaviate (for email similarity, template matching)
- **Custom Models**: Fine-tuned models for industry-specific emails

### Email Services

- **Gmail API**: Google APIs Client Library
- **Outlook API**: Microsoft Graph API
- **Tracking**: Custom pixel tracking + link redirects
- **SMTP Fallback**: SendGrid or AWS SES

### Infrastructure

- **Hosting**: AWS or Google Cloud Platform
- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: Datadog or New Relic
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking**: Sentry

### Third-Party Services

- **CRM**: Salesforce, HubSpot, Pipedrive APIs
- **Calendar**: Calendly, Cal.com APIs
- **Notifications**: Slack API, Twilio (SMS)
- **Analytics**: Mixpanel or Amplitude
- **Email Verification**: ZeroBounce or NeverBounce

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Web App (React)  │  Chrome Extension  │  Mobile App (RN)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  API Gateway (Kong/AWS API Gateway)                          │
│  - Rate Limiting                                             │
│  - Authentication                                            │
│  - Request Routing                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Email      │  │   Campaign   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   AI         │  │   Analytics  │  │   Team       │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Integration│  │   Sequence   │  │   Template   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  Elasticsearch  │  S3  │  Vector DB│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  Gmail API  │  Outlook API  │  OpenAI  │  CRM APIs  │  etc. │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKGROUND WORKERS                         │
├─────────────────────────────────────────────────────────────┤
│  Email Queue Worker  │  Sequence Worker  │  Analytics Worker│
│  Webhook Worker      │  Email Warmup     │  Bounce Handler  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

#### Core Modules

1. **Authentication Module**

   - Login/Register
   - OAuth flows (Gmail, Outlook)
   - Session management
   - Password reset

2. **Dashboard Module**

   - Overview stats
   - Recent campaigns
   - Quick actions
   - Activity feed

3. **Email Composer Module**

   - Rich text editor
   - Template selector
   - AI assistant panel
   - Variable insertion
   - Preview (desktop/mobile)
   - Send/Draft actions

4. **Template Library Module**

   - Template browser
   - Category filters
   - Search functionality
   - Template editor
   - Custom template creation

5. **Campaign Module**

   - Campaign list
   - Campaign builder
   - Lead import (CSV)
   - Campaign settings
   - Campaign analytics

6. **Sequence Module**

   - Sequence builder (drag-and-drop)
   - Step configuration
   - Delay settings
   - Condition logic
   - Template assignment

7. **Analytics Module**

   - Performance dashboard
   - Charts and graphs
   - Export functionality
   - A/B test results
   - Template performance

8. **Team Module**

   - Team members
   - Role management
   - Shared resources
   - Activity logs

9. **Settings Module**
   - Account settings
   - Email account management
   - Integrations
   - Billing
   - API keys

### Backend Services

#### Service Layer Pattern

1. **Auth Service**

   - User registration/login
   - JWT token management
   - OAuth callback handling
   - Password hashing (bcrypt)
   - Session management

2. **Email Service**

   - Email composition
   - Template rendering
   - Variable replacement
   - Email validation
   - Send via Gmail/Outlook API
   - Draft management

3. **AI Service**

   - GPT-4 integration
   - Email generation
   - Tone adjustment
   - Subject line generation
   - Grammar check
   - Personalization suggestions

4. **Campaign Service**

   - Campaign CRUD
   - Lead management
   - Campaign execution
   - Status tracking
   - Pause/resume

5. **Sequence Service**

   - Sequence builder logic
   - Step execution
   - Delay calculation
   - Condition evaluation
   - Auto-send scheduling

6. **Analytics Service**

   - Event tracking
   - Open tracking
   - Click tracking
   - Reply detection
   - Performance calculation
   - Report generation

7. **Integration Service**

   - CRM sync (Salesforce, HubSpot, Pipedrive)
   - Calendar integration
   - Webhook management
   - API key management

8. **Team Service**

   - Team management
   - Role-based access control (RBAC)
   - Shared resources
   - Activity logging

9. **Template Service**
   - Template CRUD
   - Category management
   - Template sharing
   - Version control

---

## Database Design

### Core Tables

#### Users & Authentication

```sql
users
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- company_name (VARCHAR)
- role (ENUM: admin, user)
- subscription_tier (ENUM: free, pro, enterprise)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)

oauth_connections
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- provider (ENUM: gmail, outlook)
- provider_user_id (VARCHAR)
- access_token (TEXT, encrypted)
- refresh_token (TEXT, encrypted)
- token_expires_at (TIMESTAMP)
- email_address (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

teams
- id (UUID, PK)
- name (VARCHAR)
- owner_id (UUID, FK -> users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

team_members
- id (UUID, PK)
- team_id (UUID, FK -> teams.id)
- user_id (UUID, FK -> users.id)
- role (ENUM: admin, member, viewer)
- joined_at (TIMESTAMP)
```

#### Templates

```sql
templates
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- team_id (UUID, FK -> teams.id, nullable)
- name (VARCHAR)
- subject (VARCHAR)
- body (TEXT)
- category (VARCHAR)
- is_public (BOOLEAN)
- is_prebuilt (BOOLEAN)
- variables (JSONB) -- e.g., ["firstName", "company"]
- usage_count (INTEGER)
- performance_score (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

template_categories
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
```

#### Campaigns & Sequences

```sql
campaigns
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- team_id (UUID, FK -> teams.id, nullable)
- name (VARCHAR)
- sequence_id (UUID, FK -> sequences.id)
- status (ENUM: draft, active, paused, completed)
- total_leads (INTEGER)
- emails_sent (INTEGER)
- emails_opened (INTEGER)
- replies_received (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- started_at (TIMESTAMP)
- completed_at (TIMESTAMP)

sequences
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- team_id (UUID, FK -> teams.id, nullable)
- name (VARCHAR)
- description (TEXT)
- steps (JSONB) -- Array of step objects
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

sequence_steps
- id (UUID, PK)
- sequence_id (UUID, FK -> sequences.id)
- step_order (INTEGER)
- template_id (UUID, FK -> templates.id)
- delay_days (INTEGER)
- delay_hours (INTEGER)
- conditions (JSONB) -- e.g., {"if_no_reply": true, "if_opened": false}
- subject_override (VARCHAR, nullable)
- created_at (TIMESTAMP)
```

#### Leads

```sql
leads
- id (UUID, PK)
- campaign_id (UUID, FK -> campaigns.id)
- email (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- company (VARCHAR)
- job_title (VARCHAR)
- custom_fields (JSONB)
- status (ENUM: pending, sent, opened, replied, bounced, unsubscribed)
- current_step (INTEGER)
- last_email_sent_at (TIMESTAMP)
- last_opened_at (TIMESTAMP)
- last_replied_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

lead_research_data
- id (UUID, PK)
- lead_id (UUID, FK -> leads.id)
- company_domain (VARCHAR)
- company_size (VARCHAR)
- industry (VARCHAR)
- location (VARCHAR)
- recent_news (JSONB)
- tech_stack (JSONB)
- linkedin_url (VARCHAR)
- research_data (JSONB) -- Full research object
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Emails

```sql
emails
- id (UUID, PK)
- campaign_id (UUID, FK -> campaigns.id)
- lead_id (UUID, FK -> leads.id)
- sequence_step_id (UUID, FK -> sequence_steps.id)
- template_id (UUID, FK -> templates.id)
- from_email (VARCHAR)
- to_email (VARCHAR)
- subject (VARCHAR)
- body_html (TEXT)
- body_text (TEXT)
- status (ENUM: draft, queued, sent, failed, bounced)
- tracking_pixel_id (UUID, UNIQUE)
- sent_at (TIMESTAMP)
- opened_at (TIMESTAMP)
- clicked_at (TIMESTAMP)
- replied_at (TIMESTAMP)
- created_at (TIMESTAMP)

email_clicks
- id (UUID, PK)
- email_id (UUID, FK -> emails.id)
- link_url (VARCHAR)
- clicked_at (TIMESTAMP)
- ip_address (VARCHAR)
- user_agent (VARCHAR)
```

#### Analytics

```sql
analytics_events
- id (UUID, PK)
- event_type (ENUM: email_sent, email_opened, email_clicked, email_replied, email_bounced)
- email_id (UUID, FK -> emails.id, nullable)
- campaign_id (UUID, FK -> campaigns.id, nullable)
- template_id (UUID, FK -> templates.id, nullable)
- user_id (UUID, FK -> users.id)
- metadata (JSONB)
- created_at (TIMESTAMP)

campaign_analytics
- id (UUID, PK)
- campaign_id (UUID, FK -> campaigns.id)
- date (DATE)
- emails_sent (INTEGER)
- emails_opened (INTEGER)
- emails_clicked (INTEGER)
- replies_received (INTEGER)
- bounces (INTEGER)
- unsubscribes (INTEGER)
- created_at (TIMESTAMP)
```

#### Integrations

```sql
integrations
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- team_id (UUID, FK -> teams.id, nullable)
- provider (ENUM: salesforce, hubspot, pipedrive, calendly, slack)
- access_token (TEXT, encrypted)
- refresh_token (TEXT, encrypted)
- config (JSONB)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### A/B Tests

```sql
ab_tests
- id (UUID, PK)
- campaign_id (UUID, FK -> campaigns.id)
- name (VARCHAR)
- variant_a_template_id (UUID, FK -> templates.id)
- variant_b_template_id (UUID, FK -> templates.id)
- split_percentage (INTEGER) -- e.g., 50
- status (ENUM: running, completed)
- winner_template_id (UUID, FK -> templates.id, nullable)
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)
```

---

## API Architecture

### RESTful API Structure

#### Base URL

```
https://api.salescopilot.com/v1
```

#### Authentication

```
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password
```

#### OAuth

```
GET  /oauth/gmail/authorize
GET  /oauth/gmail/callback
GET  /oauth/outlook/authorize
GET  /oauth/outlook/callback
GET  /oauth/connections
DELETE /oauth/connections/:id
```

#### Templates

```
GET    /templates
GET    /templates/:id
POST   /templates
PUT    /templates/:id
DELETE /templates/:id
GET    /templates/categories
POST   /templates/:id/duplicate
GET    /templates/:id/performance
```

#### Campaigns

```
GET    /campaigns
GET    /campaigns/:id
POST   /campaigns
PUT    /campaigns/:id
DELETE /campaigns/:id
POST   /campaigns/:id/start
POST   /campaigns/:id/pause
POST   /campaigns/:id/resume
GET    /campaigns/:id/analytics
GET    /campaigns/:id/leads
POST   /campaigns/:id/leads/import
```

#### Sequences

```
GET    /sequences
GET    /sequences/:id
POST   /sequences
PUT    /sequences/:id
DELETE /sequences/:id
POST   /sequences/:id/duplicate
```

#### Leads

```
GET    /leads
GET    /leads/:id
POST   /leads
PUT    /leads/:id
DELETE /leads/:id
POST   /leads/:id/research
GET    /leads/:id/emails
```

#### Emails

```
GET    /emails
GET    /emails/:id
POST   /emails/send
POST   /emails/draft
GET    /emails/:id/preview
POST   /emails/:id/generate-ai
```

#### Analytics

```
GET    /analytics/dashboard
GET    /analytics/campaigns/:id
GET    /analytics/templates
GET    /analytics/export
```

#### AI

```
POST   /ai/generate-email
POST   /ai/improve-email
POST   /ai/generate-subject
POST   /ai/check-grammar
POST   /ai/adjust-tone
POST   /ai/generate-icebreaker
```

#### Team

```
GET    /teams
GET    /teams/:id
POST   /teams
PUT    /teams/:id
DELETE /teams/:id
GET    /teams/:id/members
POST   /teams/:id/members
PUT    /teams/:id/members/:memberId
DELETE /teams/:id/members/:memberId
```

#### Integrations

```
GET    /integrations
GET    /integrations/:id
POST   /integrations
PUT    /integrations/:id
DELETE /integrations/:id
POST   /integrations/:id/sync
```

### WebSocket Events

```
Connection: ws://api.salescopilot.com/ws

Events:
- campaign:status:updated
- email:sent
- email:opened
- email:replied
- campaign:completed
- team:activity
```

---

## Third-Party Integrations

### Email Providers

1. **Gmail API**

   - OAuth 2.0 flow
   - Send email
   - Create draft
   - Read messages (reply detection)
   - Labels management

2. **Outlook/Microsoft Graph API**
   - OAuth 2.0 flow
   - Send email
   - Create draft
   - Read messages
   - Calendar integration

### AI Services

1. **OpenAI API**

   - GPT-4 for email generation
   - Embeddings for similarity
   - Fine-tuning for custom models

2. **Vector Database (Pinecone/Weaviate)**
   - Store email embeddings
   - Template similarity search
   - Personalization matching

### CRM Integrations

1. **Salesforce**

   - REST API
   - OAuth 2.0
   - Contact sync
   - Email logging
   - Deal stage updates

2. **HubSpot**

   - REST API
   - OAuth 2.0
   - Contact sync
   - Email logging
   - Deal pipeline updates

3. **Pipedrive**
   - REST API
   - OAuth 2.0
   - Contact sync
   - Email logging
   - Deal updates

### Other Integrations

1. **Calendly/Cal.com**

   - Webhook for meeting booking
   - Calendar sync

2. **Slack**

   - Webhook notifications
   - Team activity updates

3. **Zapier**
   - Webhook API
   - Custom triggers

---

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Access token (15min) + Refresh token (7 days)
- **OAuth 2.0**: For Gmail, Outlook, CRM integrations
- **Password Hashing**: bcrypt with salt rounds 12
- **Rate Limiting**: Redis-based, per user/IP
- **CORS**: Configured for specific domains
- **CSRF Protection**: Token-based

### Data Security

- **Encryption at Rest**: Database encryption (AES-256)
- **Encryption in Transit**: TLS 1.3
- **Token Storage**: Encrypted in database (AES-256)
- **PII Handling**: GDPR compliant, data anonymization
- **API Keys**: Encrypted storage, rotation policy

### Infrastructure Security

- **WAF**: Cloudflare or AWS WAF
- **DDoS Protection**: Cloudflare
- **VPC**: Isolated network segments
- **Secrets Management**: AWS Secrets Manager or HashiCorp Vault
- **Security Monitoring**: SIEM integration

### Compliance

- **GDPR**: Data export, deletion, consent management
- **SOC 2**: Audit logs, access controls
- **Email Compliance**: CAN-SPAM, unsubscribe handling

---

## Scalability & Performance

### Horizontal Scaling

- **Stateless Services**: All services are stateless
- **Load Balancing**: Application Load Balancer (ALB)
- **Auto-scaling**: Kubernetes HPA or AWS Auto Scaling
- **Database**: Read replicas, connection pooling

### Caching Strategy

- **Redis Cache Layers**:
  - Session cache
  - Template cache
  - User profile cache
  - Campaign stats cache
  - Rate limiting

### Database Optimization

- **Indexing**: Strategic indexes on foreign keys, search fields
- **Partitioning**: Large tables (emails, analytics_events) by date
- **Connection Pooling**: PgBouncer or similar
- **Read Replicas**: For analytics queries

### Background Jobs

- **Queue System**: BullMQ with Redis
- **Workers**: Separate worker pools for different job types
- **Priority Queues**: High priority for sends, low for analytics
- **Retry Logic**: Exponential backoff

### Performance Targets

- **API Response**: <500ms for 95th percentile
- **Page Load**: <2s initial load
- **Email Send**: <5s queue to sent
- **Database Queries**: <100ms for 95th percentile

---

## Deployment Architecture

### Environment Structure

```
Production
├── Web Tier (3+ instances)
├── API Tier (5+ instances)
├── Worker Tier (10+ workers)
├── Database (Primary + 2 Replicas)
├── Redis Cluster (3 nodes)
└── Elasticsearch Cluster (3 nodes)

Staging
├── Web Tier (1 instance)
├── API Tier (2 instances)
├── Worker Tier (2 workers)
├── Database (Single instance)
└── Redis (Single instance)

Development
├── Local Docker Compose
└── Shared Dev Environment
```

### CI/CD Pipeline

```
1. Code Push → GitHub
2. GitHub Actions Trigger
3. Run Tests (Unit, Integration, E2E)
4. Build Docker Images
5. Security Scan
6. Deploy to Staging
7. Run Smoke Tests
8. Manual Approval
9. Deploy to Production
10. Health Checks
11. Rollback on Failure
```

### Monitoring & Observability

- **APM**: New Relic or Datadog
- **Logging**: ELK Stack
- **Metrics**: Prometheus + Grafana
- **Alerts**: PagerDuty integration
- **Uptime Monitoring**: Pingdom or UptimeRobot

### Disaster Recovery

- **Database Backups**: Daily automated backups, 30-day retention
- **Cross-Region Replication**: For critical data
- **RTO**: 4 hours
- **RPO**: 1 hour

---

## Phase-Specific Architecture Considerations

### Phase 1 (MVP)

- **Simplified Stack**: Single database, basic caching
- **Single Region**: Cost optimization
- **Basic Monitoring**: Essential metrics only

### Phase 2-3 (Automation)

- **Queue System**: BullMQ implementation
- **Worker Scaling**: Auto-scaling workers
- **Background Jobs**: Scheduled tasks

### Phase 4 (Analytics)

- **Analytics DB**: Separate read replica for analytics
- **Event Streaming**: Kafka or AWS Kinesis (optional)
- **Data Warehouse**: Redshift or BigQuery (optional)

### Phase 5 (Teams)

- **Multi-tenancy**: Team-based data isolation
- **RBAC**: Role-based access control
- **Activity Logging**: Audit trail

### Phase 6 (Integrations)

- **Webhook System**: Reliable webhook delivery
- **Integration Framework**: Plugin architecture
- **API Gateway**: Rate limiting per integration

### Phase 7 (Mobile/Extension)

- **API Versioning**: v1, v2 support
- **Mobile API**: Optimized endpoints
- **Extension Backend**: Special endpoints for extension

### Phase 8 (Enterprise)

- **White Label**: Multi-tenant with custom domains
- **SSO**: SAML/OIDC support
- **Advanced RBAC**: Granular permissions
- **Audit Logs**: Comprehensive logging

---

## Next Steps

1. **Set up project structure** with monorepo (Turborepo or Nx)
2. **Initialize database** with migrations (Prisma or TypeORM)
3. **Set up CI/CD pipeline**
4. **Create API documentation** (OpenAPI/Swagger)
5. **Set up development environment** (Docker Compose)
6. **Implement authentication** (Phase 1, Week 1-2)
7. **Build core services** incrementally

---

## Appendix: Technology Decisions

### Why PostgreSQL?

- ACID compliance
- JSONB support for flexible schemas
- Excellent performance
- Rich ecosystem

### Why Redis?

- Fast in-memory operations
- Pub/sub for real-time features
- Perfect for queues and caching
- Widely supported

### Why React?

- Large ecosystem
- Component reusability
- Strong TypeScript support
- Great for complex UIs

### Why Node.js?

- JavaScript everywhere
- Fast development
- Great async support
- Large package ecosystem

### Why BullMQ?

- Redis-based (reliable)
- Job prioritization
- Retry logic
- Good monitoring

---

_Last Updated: [Current Date]_
_Version: 1.0_
