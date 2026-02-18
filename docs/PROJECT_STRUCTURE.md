# AI Sales Email Copilot - Project Structure

## Recommended Monorepo Structure

```
sales-copilot/
├── .github/
│   └── workflows/           # CI/CD pipelines
├── apps/
│   ├── web/                 # React web application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── store/       # State management
│   │   │   ├── services/    # API services
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── types/       # TypeScript types
│   │   │   └── styles/      # CSS/styled components
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── mobile/              # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── ios/
│   │   ├── android/
│   │   └── package.json
│   │
│   └── extension/           # Chrome extension
│       ├── src/
│       │   ├── content/     # Content scripts
│       │   ├── background/  # Background scripts
│       │   ├── popup/       # Extension popup
│       │   └── options/     # Options page
│       ├── manifest.json
│       └── package.json
│
├── packages/
│   ├── api/                 # Backend API server
│   │   ├── src/
│   │   │   ├── controllers/ # Route controllers
│   │   │   ├── services/    # Business logic
│   │   │   ├── models/      # Data models
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── routes/      # API routes
│   │   │   ├── workers/     # Background workers
│   │   │   ├── utils/       # Utilities
│   │   │   └── types/       # TypeScript types
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── database/            # Database schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   ├── shared/              # Shared code (types, utils)
│   │   ├── src/
│   │   │   ├── types/       # Shared TypeScript types
│   │   │   ├── constants/   # Shared constants
│   │   │   ├── utils/       # Shared utilities
│   │   │   └── validations/ # Zod schemas
│   │   └── package.json
│   │
│   └── ui/                  # Shared UI components
│       ├── src/
│       │   ├── components/
│       │   ├── themes/
│       │   └── styles/
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── docker-compose.yml
│   ├── kubernetes/
│   │   ├── api/
│   │   ├── web/
│   │   └── workers/
│   └── terraform/           # Infrastructure as code
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SYSTEM_DESIGN.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   └── seed.sh
│
├── .env.example
├── .gitignore
├── package.json            # Root package.json
├── turbo.json              # Turborepo config
├── tsconfig.json           # Root TypeScript config
└── README.md
```

---

## Detailed Directory Structure

### Apps/Web Structure

```
apps/web/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   │
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── Card/
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── auth/            # Auth components
│   │   │   ├── LoginForm/
│   │   │   ├── RegisterForm/
│   │   │   └── OAuthButton/
│   │   │
│   │   ├── email/           # Email components
│   │   │   ├── Composer/
│   │   │   ├── Editor/
│   │   │   ├── Preview/
│   │   │   ├── TemplateSelector/
│   │   │   └── VariableInsert/
│   │   │
│   │   ├── campaign/        # Campaign components
│   │   │   ├── CampaignList/
│   │   │   ├── CampaignCard/
│   │   │   ├── CampaignBuilder/
│   │   │   └── LeadImport/
│   │   │
│   │   ├── sequence/        # Sequence components
│   │   │   ├── SequenceBuilder/
│   │   │   ├── StepCard/
│   │   │   └── DelayConfig/
│   │   │
│   │   ├── analytics/       # Analytics components
│   │   │   ├── Dashboard/
│   │   │   ├── Charts/
│   │   │   └── Reports/
│   │   │
│   │   └── team/            # Team components
│   │       ├── TeamMembers/
│   │       ├── InviteModal/
│   │       └── RoleSelector/
│   │
│   ├── pages/               # Page components
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   │
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── Email/
│   │   │   ├── Composer.tsx
│   │   │   └── Templates.tsx
│   │   │
│   │   ├── Campaigns/
│   │   │   ├── CampaignList.tsx
│   │   │   ├── CampaignDetail.tsx
│   │   │   └── CampaignBuilder.tsx
│   │   │
│   │   ├── Sequences/
│   │   │   ├── SequenceList.tsx
│   │   │   └── SequenceBuilder.tsx
│   │   │
│   │   ├── Analytics/
│   │   │   └── Analytics.tsx
│   │   │
│   │   ├── Team/
│   │   │   └── Team.tsx
│   │   │
│   │   └── Settings/
│   │       └── Settings.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCampaign.ts
│   │   ├── useEmail.ts
│   │   ├── useTemplates.ts
│   │   └── useAnalytics.ts
│   │
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   ├── campaignStore.ts
│   │   ├── templateStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/            # API services
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── campaigns.ts
│   │   │   ├── emails.ts
│   │   │   ├── templates.ts
│   │   │   └── analytics.ts
│   │   │
│   │   └── client.ts        # Axios instance
│   │
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── auth.ts
│   │   ├── campaign.ts
│   │   ├── email.ts
│   │   └── user.ts
│   │
│   └── styles/              # Global styles
│       ├── theme.ts
│       └── globals.css
│
├── public/
│   ├── favicon.ico
│   └── assets/
│
├── .env.local
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Packages/API Structure

```
packages/api/
├── src/
│   ├── index.ts             # Entry point
│   │
│   ├── config/              # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── campaign.controller.ts
│   │   ├── email.controller.ts
│   │   ├── template.controller.ts
│   │   ├── sequence.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── team.controller.ts
│   │   └── integration.controller.ts
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── campaign.service.ts
│   │   ├── email.service.ts
│   │   ├── template.service.ts
│   │   ├── sequence.service.ts
│   │   ├── analytics.service.ts
│   │   ├── ai.service.ts
│   │   ├── oauth.service.ts
│   │   └── integration.service.ts
│   │
│   ├── models/              # Data models (Prisma)
│   │   └── index.ts         # Prisma client export
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── routes/              # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── campaign.routes.ts
│   │   ├── email.routes.ts
│   │   ├── template.routes.ts
│   │   ├── sequence.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── team.routes.ts
│   │   └── integration.routes.ts
│   │
│   ├── workers/             # Background workers
│   │   ├── email.worker.ts
│   │   ├── sequence.worker.ts
│   │   ├── analytics.worker.ts
│   │   ├── webhook.worker.ts
│   │   └── warmup.worker.ts
│   │
│   ├── queues/              # BullMQ queues
│   │   ├── email.queue.ts
│   │   ├── sequence.queue.ts
│   │   └── analytics.queue.ts
│   │
│   ├── utils/               # Utilities
│   │   ├── logger.ts
│   │   ├── encryption.ts
│   │   ├── emailParser.ts
│   │   └── helpers.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── express.d.ts     # Express type extensions
│   │   └── index.ts
│   │
│   └── validators/          # Request validators
│       ├── auth.validator.ts
│       ├── campaign.validator.ts
│       └── email.validator.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.ts
```

### Packages/Database Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   │   ├── 20240101000000_init/
│   │   └── ...
│   │
│   └── seed.ts              # Database seeding
│
├── scripts/
│   ├── migrate.ts
│   └── seed.ts
│
└── package.json
```

### Packages/Shared Structure

```
packages/shared/
├── src/
│   ├── types/               # Shared TypeScript types
│   │   ├── api.ts
│   │   ├── campaign.ts
│   │   ├── email.ts
│   │   ├── user.ts
│   │   └── index.ts
│   │
│   ├── constants/           # Shared constants
│   │   ├── routes.ts
│   │   ├── status.ts
│   │   └── errors.ts
│   │
│   ├── utils/               # Shared utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   └── validations/         # Zod schemas
│       ├── auth.schema.ts
│       ├── campaign.schema.ts
│       └── email.schema.ts
│
└── package.json
```

---

## File Naming Conventions

### Components
- **PascalCase** for component files: `EmailComposer.tsx`
- **PascalCase** for component directories: `EmailComposer/`
- **index.tsx** for component entry: `EmailComposer/index.tsx`

### Utilities & Services
- **camelCase** for files: `emailService.ts`
- **camelCase** for functions: `sendEmail()`

### Types & Interfaces
- **PascalCase** for types: `Email`, `Campaign`
- **I prefix** for interfaces (optional): `IEmailService`

### Constants
- **UPPER_SNAKE_CASE** for constants: `MAX_EMAIL_LENGTH`

### Routes
- **kebab-case** for URLs: `/campaigns/:id/analytics`

---

## Module Organization Principles

### 1. Feature-Based Organization
Group related files by feature:
```
campaign/
├── CampaignList.tsx
├── CampaignCard.tsx
├── CampaignService.ts
├── campaignStore.ts
└── campaign.types.ts
```

### 2. Layer-Based Organization
Separate by architectural layers:
```
src/
├── presentation/    # Components, pages
├── domain/          # Business logic, services
├── data/            # API calls, data access
└── shared/          # Utilities, types
```

### 3. Hybrid Approach (Recommended)
Combine both:
```
src/
├── features/        # Feature modules
│   ├── campaign/
│   ├── email/
│   └── analytics/
├── shared/          # Shared code
└── core/            # Core functionality
```

---

## Import Organization

### Import Order
1. External libraries
2. Internal packages
3. Relative imports
4. Types (with `type` keyword)

### Example
```typescript
// External
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal packages
import { Button } from '@sales-copilot/ui';
import { Campaign } from '@sales-copilot/shared/types';

// Relative
import { useCampaign } from '../hooks/useCampaign';
import { CampaignCard } from './CampaignCard';

// Types
import type { CampaignStatus } from '../types';
```

---

## Environment Variables

### Structure
```
.env                    # Default values
.env.local              # Local overrides (gitignored)
.env.development        # Development environment
.env.staging            # Staging environment
.env.production         # Production environment
```

### Naming Convention
- **UPPER_SNAKE_CASE**
- **Prefix** with app name: `SALES_COPILOT_API_URL`
- **Group** by service: `DATABASE_*`, `REDIS_*`, `OPENAI_*`

### Example
```env
# Database
DATABASE_URL=postgresql://...
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://...
REDIS_PASSWORD=...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Gmail
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...

# App
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
```

---

## Testing Structure

```
tests/
├── unit/              # Unit tests
│   ├── services/
│   ├── utils/
│   └── components/
│
├── integration/       # Integration tests
│   ├── api/
│   └── database/
│
└── e2e/               # End-to-end tests
    ├── auth.spec.ts
    ├── campaign.spec.ts
    └── email.spec.ts
```

---

## Documentation Structure

```
docs/
├── ARCHITECTURE.md
├── SYSTEM_DESIGN.md
├── DATABASE_SCHEMA.sql
├── TECHNOLOGY_STACK.md
├── API.md              # API documentation
├── DEPLOYMENT.md       # Deployment guide
├── DEVELOPMENT.md      # Development setup
├── CONTRIBUTING.md     # Contribution guidelines
└── PHASES/             # Phase-specific docs
    ├── phase1-mvp.md
    ├── phase2-automation.md
    └── ...
```

---

## Build & Output Directories

```
dist/                   # Build output (gitignored)
├── web/
├── api/
└── extension/

coverage/               # Test coverage (gitignored)

node_modules/           # Dependencies (gitignored)

.cache/                 # Build cache (gitignored)
```

---

## Git Structure

### Branch Strategy
```
main                    # Production
develop                 # Development
feature/*               # Feature branches
release/*               # Release branches
hotfix/*                # Hotfix branches
```

### Commit Convention
```
feat: Add email composer
fix: Fix campaign status update
docs: Update API documentation
refactor: Refactor email service
test: Add campaign tests
chore: Update dependencies
```

---

*Last Updated: [Current Date]*
*Version: 1.0*

