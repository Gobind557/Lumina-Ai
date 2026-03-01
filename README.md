# Sales Copilot

<p align="center"><strong>AI-powered sales email copilot with personalization, templates, campaigns, and analytics.</strong></p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://reactjs.org/"><img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black"></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white"></a>
  <a href="https://expressjs.com/"><img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white"></a>
  <a href="https://www.prisma.io/"><img alt="Prisma" src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white"></a>
  <a href="https://www.postgresql.org/"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white"></a>
  <a href="https://redis.io/"><img alt="Redis" src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white"></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white"></a>
</p>

## What It Does

Sales Copilot helps teams compose, personalize, and send sales emails at scale.

- Draft and rewrite emails with AI
- Manage templates and prospects
- Run campaigns and track lifecycle events
- Capture opens and replies via webhooks
- Monitor performance from a live dashboard

## Table of Contents

- [Why This Project](#why-this-project)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture Snapshot](#architecture-snapshot)
- [System Design Highlights](#system-design-highlights)
- [Performance and Reliability](#performance-and-reliability)
- [Tradeoffs and Future Improvements](#tradeoffs-and-future-improvements)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Why This Project Matters](#why-this-project-matters)
- [Documentation](#documentation)
- [License](#license)

## Why This Project

Most sales tooling is either too manual or too rigid. This project combines:

- AI-assisted writing for speed and quality
- Event-driven backend design for reliability and scale
- Modular architecture that is easy to extend

## Core Features

| Area | Capabilities |
|------|--------------|
| Email | Rich composer, draft autosave, idempotent send, open tracking |
| AI | Personalize, rewrite, and score emails with configurable tone and context |
| Templates | CRUD templates, categories, favorites, usage metrics |
| Prospects | Prospect storage and management for personalization |
| Campaigns | DRAFT/ACTIVE/PAUSED/COMPLETED/ARCHIVED, campaign prospect lifecycle updates |
| Dashboard | Stats, momentum, timeline, campaign summaries (React Query polling every 15-30s) |
| Auth | Email/password plus Google and LinkedIn OAuth with JWT API auth |

## Tech Stack

| Layer | Technologies |
|------|--------------|
| Frontend | React 18, TypeScript, Vite, React Router v6, Tailwind CSS, Recharts, Lucide React, TanStack React Query |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL, Prisma |
| Queue and Events | Redis, BullMQ, Redis Pub/Sub |
| Auth | JWT, Passport (Google OAuth 2.0, LinkedIn OAuth 2.0), bcryptjs |
| Email | Nodemailer (SMTP) |
| AI | OpenAI SDK (Groq-compatible API) |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or pnpm

### 1. Clone

```bash
git clone <repository-url>
cd "Sales Copilot"
```

### 2. Backend setup

```bash
cd backend/api
cp .env.example .env
npm install
```

Edit `backend/api/.env` with your database, redis, jwt, oauth, smtp, and ai keys.

### 3. Database setup

```bash
cd ../database
npm install
npx prisma migrate dev
# optional: npx prisma db seed
```

### 4. Run backend

```bash
cd ../api
npm run dev
```

Backend default: `http://localhost:4000`
Health endpoint: `GET /health` returns `{ "status": "ok" }`

### 5. Run workers and consumers (optional)

Option A (single process, recommended for local dev):

```bash
cd backend/api
npm run dev:all
```

Option B (separate processes):

```bash
cd backend/api
npm run worker:email
npm run consumer:analytics
npm run consumer:campaign
```

### 6. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend default: `http://localhost:5173`

If backend is on a different origin, set `VITE_API_URL` to include `/api` (example: `http://localhost:4000/api`).

## Project Structure

```text
Sales Copilot/
|-- frontend/
|   |-- src/
|   |   |-- core/
|   |   |-- features/
|   |   |   `-- <feature>/
|   |   `-- shared/
|   |-- package.json
|   `-- vite.config.ts
|
|-- backend/
|   |-- api/
|   |   |-- src/
|   |   |   |-- app/
|   |   |   |-- config/
|   |   |   |-- infrastructure/
|   |   |   |-- modules/
|   |   |   |   `-- <module>/
|   |   |   `-- shared/
|   |   `-- package.json
|   `-- database/
|       `-- prisma/
|
`-- docs/
    `-- COMBINED_DOCUMENTATION.md
```

## Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL including `/api` when using a separate origin. If unset, frontend uses relative `/api`. |

### Backend (`backend/api/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 10 chars) |
| `JWT_EXPIRES_IN` | JWT expiry (default `7d`) |
| `REDIS_URL` | Redis connection string (queue and pub/sub) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth config |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_CALLBACK_URL` | LinkedIn OAuth config |
| `GROQ_API_KEY` | AI API key |
| `GROQ_MODEL` | Model name (default `llama-3.1-8b-instant`) |
| `GROQ_BASE_URL` | AI base URL (default `https://api.groq.com/openai/v1`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | SMTP config |
| `CORS_ORIGIN` | Allowed frontend origin (default `http://localhost:5173`) |
| `APP_URL` | App base URL for redirects, links, and callbacks |

See `backend/api/.env.example` for full defaults.

## Scripts

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`backend/api/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API only |
| `npm run dev:all` | Start API + worker + analytics consumer + campaign consumer |
| `npm run build` | Build TypeScript to `dist/` |
| `npm start` | Run built app (`node dist/index.js`) |
| `npm run worker:email` | Run email worker only |
| `npm run consumer:analytics` | Run analytics consumer only |
| `npm run consumer:campaign` | Run campaign consumer only |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |

## Architecture Snapshot

Request flow:

`POST /api/emails/send` -> write `Email` -> queue job (BullMQ) -> worker sends SMTP -> publish Redis event -> consumers update analytics and campaign state.

### Event-Driven Flow (How It Works)

`EMAIL_QUEUED`, `EMAIL_SENT`, `EMAIL_OPENED`, and `EMAIL_REPLIED` are published on Redis (`sales-copilot:events`).

- Email module publishes lifecycle events.
- Analytics consumer reacts to engagement events and records analytics rows.
- Campaign consumer reacts to lifecycle/engagement events and updates campaign and prospect state.
- API request/response stays fast because side effects run asynchronously in workers/consumers.

### Queue Behavior (BullMQ)

- Queue name: `email-send`
- Job name: `send-email`
- Retry policy: `attempts: 3`
- Backoff policy: exponential, base delay `2000ms`
- Failure behavior: worker marks email as failed; BullMQ retries according to policy.

This gives reliability for transient SMTP/provider failures without blocking user-facing API calls.

### About Delayed Queues

Current implementation uses retries + backoff (above). Scheduled sequence delays are documented in architecture docs as a next-phase automation capability, but are not yet active in the current send pipeline.

Design notes:

- Idempotent email sending avoids duplicate sends on retries.
- Event-driven side effects keep API response paths fast.
- Zod environment validation fails fast for bad config.
- Domain modules keep backend features isolated and maintainable.

For deep details, see [docs/COMBINED_DOCUMENTATION.md](docs/COMBINED_DOCUMENTATION.md) and [docs/ARCHITECTURE_AND_TECH.md](docs/ARCHITECTURE_AND_TECH.md).

## System Design Highlights

- Event-driven architecture using Redis Pub/Sub (`sales-copilot:events` channel)
- Asynchronous email pipeline via BullMQ workers
- Idempotent email send logic (`idempotencyKey`) to prevent duplicate dispatch
- Retry with exponential backoff for transient SMTP failures (`attempts: 3`, base delay `2000ms`)
- Modular backend domain separation (Email, Campaign, Analytics, Auth, AI, Templates, Prospects)
- Poll-based live dashboard with React Query (15-30s interval)
- Environment validation via Zod (fail-fast configuration)

## Performance and Reliability

- Send API remains responsive because SMTP is offloaded to the queue/worker path.
- Queue retries are configured as 3 attempts with exponential backoff (`2000ms` base).
- Analytics and campaign updates are non-blocking, handled by async consumers.
- Idempotency safeguards prevent duplicate email sends during retries or repeated client requests.
- System is designed for eventual consistency on engagement metrics and campaign state updates.

## Tradeoffs and Future Improvements

- Dashboard currently uses polling; WebSocket/SSE push can reduce latency and polling overhead.
- Campaign scheduling delays are documented for automation phases, but not yet active in the current send pipeline.
- AI usage throttling and quota controls can be tightened further for cost/rate management.
- Multi-tenant workspace isolation can be expanded with stricter tenant-bound query guards and policies.
- Event durability could be upgraded from pub/sub-only fanout to a durable stream model for stronger replay guarantees.

## API Overview

Base API prefix: `/api` (health endpoint is `GET /health` at app root).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/emails/send` | Queue email send |
| GET | `/api/emails/:id` | Get email status/details |
| POST | `/api/emails/draft` | Create or update draft |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/dashboard/stats` | Dashboard metrics |
| GET | `/api/dashboard/timeline` | Dashboard timeline |
| GET | `/api/dashboard/momentum` | Dashboard momentum |
| GET | `/api/dashboard/campaigns` | Dashboard campaign summaries |

## Deployment

Recommended stack:

- Frontend: Vercel or Netlify
- Backend API/Workers: Render, Railway, or EC2
- Database: Managed PostgreSQL (Supabase, RDS, Neon)
- Redis: Upstash or Redis Cloud

Production checklist:

- Set `NODE_ENV=production`
- Configure `CORS_ORIGIN` to your frontend domain
- Use a strong `JWT_SECRET`
- Configure all OAuth callback URLs for production domains
- Run API and worker/consumer processes separately for better fault isolation

## Why This Project Matters

This project demonstrates:

- Scalable async job processing with retries/backoff
- Event-driven backend architecture with decoupled consumers
- Full-stack TypeScript architecture and modular domain boundaries
- Production-style authentication (JWT + OAuth)
- AI integration in real workflow paths (compose, rewrite, personalize, score)

## Documentation

| Document | Description |
|----------|-------------|
| [docs/COMBINED_DOCUMENTATION.md](docs/COMBINED_DOCUMENTATION.md) | Single reference for architecture, schema, APIs, env, scripts, dashboard, and campaigns |
| [docs/ARCHITECTURE_AND_TECH.md](docs/ARCHITECTURE_AND_TECH.md) | Tech choices, tradeoffs, and architectural analysis |
| [backend/api/README.md](backend/api/README.md) | API setup, run, and test details |

## License

This project is licensed under the MIT License.
