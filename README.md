# Sales Copilot

<div align="center">

**AI-powered sales email copilot with personalization, templates, and analytics**

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

Sales Copilot is a full-stack application for composing, personalizing, and sending sales emails. It combines a React SPA with an Express API, background workers for email delivery, and an event-driven pipeline for analytics. Authentication supports email/password and OAuth (Google, LinkedIn). AI features use an OpenAI-compatible API (e.g. Groq) for personalization and scoring.

---

## Features

| Area | Capabilities |
|------|--------------|
| **Email** | Rich composer, draft auto-save, idempotent send, open tracking via webhooks |
| **AI** | Personalize, rewrite, and score emails with configurable tone and prospect context |
| **Templates** | CRUD templates with categories, favorites, and usage metrics |
| **Prospects** | Store and manage prospect data for personalization |
| **Campaigns** | Campaign management and detail views |
| **Dashboard** | Metrics, timeline, and action center |
| **Auth** | Email/password signup and login, Google and LinkedIn OAuth, JWT for API |

---

## Tech stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite, React Router v6, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Zod (env validation) |
| **Database** | PostgreSQL, Prisma (ORM, migrations) |
| **Queue & events** | Redis, BullMQ (job queue), Redis pub/sub (domain events) |
| **Auth** | JWT, Passport (Google OAuth 2.0, LinkedIn OAuth 2.0), bcryptjs |
| **Email** | Nodemailer (SMTP) |
| **AI** | OpenAI SDK (Groq-compatible API) |

---

## Project structure

```
Sales Copilot/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── core/             # Router, providers (Query, Auth)
│   │   ├── features/         # auth, campaigns, dashboard, email, templates
│   │   │   └── <feature>/    # pages, components, hooks, api, types
│   │   ├── shared/           # api client, layout, constants, types, utils
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── api/                  # Express API
│   │   ├── src/
│   │   │   ├── app/          # Express app, routes, server
│   │   │   ├── config/       # Env (Zod-validated)
│   │   │   ├── infrastructure/  # Prisma, Redis queue, event bus, SMTP, logger
│   │   │   ├── modules/      # auth, email, ai, prospect, template, analytics, campaign
│   │   │   │   └── <module>/ # routes, controller, service, repository, workers/consumers
│   │   │   └── shared/       # middleware, errors, types
│   │   └── package.json
│   └── database/
│       └── prisma/           # Schema, migrations
│
└── docs/                     # Architecture and tech notes
    └── ARCHITECTURE_AND_TECH.md
```

---

## Getting started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 15+
- **Redis** 7+
- **npm** or **pnpm**

### 1. Clone and install

```bash
git clone <repository-url>
cd "Sales Copilot"
```

### 2. Backend setup

```bash
cd backend/api
cp .env.example .env
# Edit .env with your DATABASE_URL, REDIS_URL, JWT_SECRET, OAuth and SMTP keys, etc.

npm install
```

### 3. Database

From the repo root (or adjust paths as needed):

```bash
cd backend/database
npm install
npx prisma migrate dev
# Optional: npx prisma db seed
```

### 4. Run the API

```bash
cd backend/api
npm run dev
```

API runs at `http://localhost:4000` (or the port in your env). Health: `GET /health`.

### 5. Run the email worker (optional)

In a separate terminal:

```bash
cd backend/api
npm run worker:email
```

### 6. Frontend setup

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:4000 (or your API base URL)

npm install
npm run dev
```

Open `http://localhost:5173` (or the port Vite prints).

---

## Environment variables

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the API (e.g. `http://localhost:4000`) |

### Backend (`backend/api/.env`)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | API port (default `4000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`) |
| `REDIS_URL` | Redis connection string (queue + event bus) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google OAuth |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_CALLBACK_URL` | LinkedIn OAuth |
| `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL` | AI (Groq/OpenAI-compatible) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | SMTP for sending email |
| `CORS_ORIGIN` | Allowed frontend origin (e.g. `http://localhost:5173`) |

See `backend/api/.env.example` for the full list and defaults.

---

## Scripts

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

### Backend (`backend/api/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with ts-node-dev |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm run worker:email` | Start BullMQ email-send worker |
| `npm run consumer:analytics` | Start analytics event consumer |
| `npm run consumer:campaign` | Start campaign event consumer |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |

---

## Architecture

- **Frontend:** Feature-based structure; `core` (router, providers), `features/*` (pages, components, hooks, api, types), `shared` (api client, layout, constants, utils). Route guards for public vs authenticated routes; central `apiRequest` with auth and error handling.
- **Backend:** Module-based; each domain (auth, email, ai, prospect, template, analytics, campaign) has routes → controller → service → repository. Shared infrastructure: Prisma, BullMQ queue, Redis pub/sub event bus, SMTP, logger. Middleware: CORS, JSON, request ID, Passport, auth, global error handler.
- **Email flow:** API creates email record and enqueues a job → worker sends via SMTP → worker publishes `EMAIL_SENT` → consumers (e.g. analytics, campaign) react.
- **Auth:** Passport strategies for Google and LinkedIn; JWT issued after login/OAuth; protected routes use auth middleware and `req.user`.

For a detailed breakdown (rating, pros/cons, alternatives, and tech deep-dive), see **[docs/ARCHITECTURE_AND_TECH.md](docs/ARCHITECTURE_AND_TECH.md)**.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE_AND_TECH.md](docs/ARCHITECTURE_AND_TECH.md) | Architecture rating, pros/cons, alternatives, and full tech stack & concepts |
| [backend/api/README.md](backend/api/README.md) | API setup, run, and test instructions |

---

## License

This project is licensed under the MIT License.
