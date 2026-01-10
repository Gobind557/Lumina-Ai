# AI Sales Email Copilot

A comprehensive AI-powered sales email automation platform that helps sales teams create, send, and track personalized email campaigns at scale.

## 📋 Overview

This project implements a complete sales email automation solution with AI-powered email generation, automated sequences, campaign management, team collaboration, and extensive analytics.

## 🏗️ Architecture

This project follows a **monorepo architecture** with the following structure:

- **Apps**: Web application, Mobile app, Chrome extension
- **Packages**: Backend API, Database, Shared code, UI components
- **Infrastructure**: Docker, Kubernetes, Terraform configurations

### Key Components

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **AI**: OpenAI GPT-4
- **Email**: Gmail API, Outlook API

## 📚 Documentation

Comprehensive documentation is available:

### MVP Focus (Lumina Flow)
- **[LUMINA_FLOW.md](./LUMINA_FLOW.md)** - **End-to-end flow architecture** (MVP focus)
- **[API_ENDPOINTS_MVP.md](./API_ENDPOINTS_MVP.md)** - MVP API endpoints specification

### Full Architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview (all phases)
- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** - Detailed system design
- **[DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql)** - Complete database schema
- **[TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)** - Technology choices and rationale
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project organization
- **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** - Visual architecture diagrams

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for containerized setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sales-copilot.git
cd sales-copilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:migrate
npm run db:seed

# Start development servers
npm run dev
```

### Development

```bash
# Start all services
npm run dev

# Start specific service
npm run dev:web      # Web app
npm run dev:api      # Backend API
npm run dev:worker   # Background workers

# Run tests
npm run test

# Run linting
npm run lint
```

## 📦 Project Phases

### Phase 1: MVP (Weeks 1-6) - **Lumina Flow**
**Focus**: Single email composition with AI assistance

- User authentication
- Gmail OAuth integration
- **Draft-first email composer** (local-first editing)
- **AI as pure function** (personalize, rewrite, score)
- **Glow System** for AI state visualization
- **Human-in-the-loop** decision making
- **Idempotent send flow** with event logging
- Basic email tracking (opens, replies, bounces)

**See [LUMINA_FLOW.md](./LUMINA_FLOW.md) for complete flow documentation**

### Phase 2: Automation (Weeks 7-10)
- Sequence builder
- Campaign management
- Auto-send scheduler
- Reply detection

### Phase 3: Personalization (Weeks 11-14)
- Company research
- Auto-fetch company data
- Smart icebreaker generation

### Phase 4: Analytics (Weeks 15-18)
- Advanced analytics dashboard
- A/B testing
- Performance optimization

### Phase 5: Teams (Weeks 19-22)
- Team workspace
- Role-based access
- Collaboration features

### Phase 6: Integrations (Weeks 23-26)
- CRM integrations (Salesforce, HubSpot, Pipedrive)
- Calendar integrations
- Webhook API

### Phase 7: Mobile & Extensions (Weeks 27-30)
- Chrome extension
- iOS & Android apps

### Phase 8: Enterprise (Weeks 31-36)
- White label
- SSO
- Advanced permissions
- Email warmup

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Material-UI / Tailwind CSS
- Zustand (state management)
- TanStack Query (data fetching)
- Vite (build tool)

### Backend
- Node.js 20 + TypeScript
- Express.js
- Prisma (ORM)
- BullMQ (job queues)
- Socket.io (WebSockets)

### Database
- PostgreSQL 15+ (primary)
- Redis 7+ (cache/queue)
- Elasticsearch (search)
- Pinecone (vector DB for AI)

### AI/ML
- OpenAI GPT-4
- OpenAI Embeddings

### Infrastructure
- Docker + Kubernetes
- AWS / GCP
- GitHub Actions (CI/CD)

## 📁 Project Structure

```
sales-copilot/
├── apps/
│   ├── web/              # React web app
│   ├── mobile/           # React Native app
│   └── extension/        # Chrome extension
├── packages/
│   ├── api/              # Backend API
│   ├── database/         # Prisma schema
│   ├── shared/           # Shared code
│   └── ui/               # UI components
├── infrastructure/       # Docker, K8s, Terraform
└── docs/                 # Documentation
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed structure.

## 🔐 Environment Variables

Key environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/salescopilot

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...

# Gmail OAuth
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...

# App
NODE_ENV=development
PORT=3000
JWT_SECRET=...
```

See `.env.example` for complete list.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 API Documentation

API documentation is available at `/api/docs` when running the development server.

See [API.md](./docs/API.md) for detailed API reference.

## 🚢 Deployment

### Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Kubernetes

```bash
# Apply configurations
kubectl apply -f infrastructure/kubernetes/
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment guide.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@salescopilot.com or open an issue in the repository.

## 📈 Roadmap

See the [Phases](#-project-phases) section above for the complete 36-week roadmap.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Google for Gmail API
- Microsoft for Outlook API
- All open-source contributors

---

**Built with ❤️ by the Sales Copilot Team**

