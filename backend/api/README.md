# Sales Copilot API (MVP)

## Setup

1. Copy env file:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Ensure PostgreSQL and Redis are running.
4. Run Prisma migrations (from `packages/database`):
   - `npm run migrate:dev`

## Run

- Development server:
  - `npm run dev`
- Email worker:
  - `npm run worker:email`

## Tests

Tests expect a running PostgreSQL database and valid env values:

- `npm test`

## Environment variables

See `.env.example` for required values.
