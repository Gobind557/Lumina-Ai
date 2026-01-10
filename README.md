# Lumina AI Sales Copilot

<div align="center">

**A modern AI-powered sales email copilot with intelligent personalization and real-time insights**

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🚀 Features

- ✍️ **Rich Text Email Composer** - Modern editor with formatting tools
- 🤖 **AI-Powered Personalization** - User-controlled AI suggestions
- 📊 **Real-Time Insights** - Prospect insights, activity feed, and spam risk analysis
- 🎨 **Modern UI/UX** - Dark blue glassmorphic design with smooth animations
- 📈 **Quick Stats** - Word count and read time estimation
- 🔍 **Activity Tracking** - Monitor email opens, link clicks, and replies
- 🎯 **Prospect Intelligence** - View prospect details and company information

---

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Lucide React** - Modern icon library

### Design System
- **Glassmorphic UI** - Translucent cards with backdrop blur
- **Dark Blue Theme** - Professional color palette
- **Responsive Design** - Mobile-first approach

---

## 📁 Project Structure

```
Sales Copilot/
├── frontend/                    # Frontend application
│   ├── src/
│   │   ├── features/           # Feature modules
│   │   │   ├── email/          # Email composer feature
│   │   │   ├── campaigns/      # Campaigns feature
│   │   │   ├── dashboard/      # Dashboard feature
│   │   │   └── templates/      # Templates feature
│   │   ├── shared/             # Shared code
│   │   │   ├── components/     # Shared components
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── utils/          # Utility functions
│   │   │   └── constants/      # Constants
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── Architecture plan/           # Architecture documentation (gitignored)
    ├── ARCHITECTURE.md
    ├── SYSTEM_DESIGN.md
    ├── DATABASE_SCHEMA.sql
    ├── API_ENDPOINTS_MVP.md
    └── ...
```

---

## 🏗️ Architecture Overview

### Core Design Philosophy

1. **Local-First Editing** - Instant feedback, debounced persistence
2. **AI as Pure Function** - AI operations never write to database, always return suggestions
3. **Human-in-the-Loop** - User controls all AI actions, suggestions are optional
4. **Deterministic Send Flow** - Idempotent operations prevent duplicates
5. **Event-Driven Analytics** - Append-only event log for analytics

### System Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  • Email Composer                       │
│  • Copilot Panel (Insights)             │
│  • Local State Management               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         API Layer (REST)                │
│  • Draft Management                     │
│  • AI Endpoints (Pure Functions)        │
│  • Send Endpoint (Idempotent)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Background Workers                 │
│  • Email Send Worker                    │
│  • Event Processor                      │
│  • Analytics Aggregator                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Data Layer                         │
│  • PostgreSQL (Primary DB)              │
│  • Redis (Cache & Queues)               │
└─────────────────────────────────────────┘
```

### Key Components

- **Email Composer**: Rich text editor with local state management
- **Copilot Panel**: Real-time insights including prospect info, activity feed, quick stats, and spam risk
- **Draft Manager**: Debounced auto-save functionality
- **AI Integration**: User-controlled AI suggestions for personalization

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ LTS
- **npm** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Sales Copilot"
   ```

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 🎨 Design System

### Color Palette

- **Background**: Dark blue gradient (`#0f172a` → `#1e293b`)
- **Cards**: Blue glassmorphic (`bg-blue-900/30` with backdrop blur)
- **Borders**: Subtle blue borders (`border-blue-800/40`)
- **Text**: White primary, blue-200/300 for secondary text
- **Accents**: Blue-600 for primary actions, purple-blue gradients for AI features

### Glassmorphic Components

- `.glass` - Light glass effect
- `.glass-strong` - Stronger glass effect
- `.glass-card` - Card with glass effect
- `.glass-nav` - Navigation with glass effect

### Typography

- **Headings**: Bold white text
- **Body**: Gray-100/Gray-200
- **Labels**: Uppercase, small, blue-300
- **Muted**: Gray-400/Gray-500

---

## 📚 Architecture Documentation

For detailed architecture information, see the `Architecture plan/` directory (excluded from git):

- **[ARCHITECTURE.md](Architecture%20plan/ARCHITECTURE.md)** - Complete system architecture
- **[SYSTEM_DESIGN.md](Architecture%20plan/SYSTEM_DESIGN.md)** - System design document
- **[DATABASE_SCHEMA.sql](Architecture%20plan/DATABASE_SCHEMA.sql)** - Database schema
- **[API_ENDPOINTS_MVP.md](Architecture%20plan/API_ENDPOINTS_MVP.md)** - API endpoints documentation
- **[TECHNOLOGY_STACK.md](Architecture%20plan/TECHNOLOGY_STACK.md)** - Complete technology stack
- **[MVP_ARCHITECTURE_SUMMARY.md](Architecture%20plan/MVP_ARCHITECTURE_SUMMARY.md)** - MVP architecture summary
- **[LUMINA_FLOW.md](Architecture%20plan/LUMINA_FLOW.md)** - Application flow documentation

### Architecture Highlights

#### Frontend Architecture
- **Feature-based structure** - Organized by domain features
- **Shared components** - Reusable UI components
- **Type-safe** - Full TypeScript coverage
- **Component composition** - Modular and maintainable

#### Backend Architecture (Planned)
- **RESTful API** - Express.js with TypeScript
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queues
- **Background Workers** - BullMQ for async processing
- **AI Integration** - OpenAI GPT-4 for personalization

#### Data Flow
1. User types in email composer (local state)
2. Draft auto-saves via debounced API calls
3. AI suggestions fetched on-demand (user-controlled)
4. Send action creates immutable email record
5. Background workers handle actual sending
6. Events logged for analytics

---

## 🔐 Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Lumina AI Sales Copilot
```

---

## 🧪 Development

### Code Style

- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prettier** - Code formatting (recommended)

### Best Practices

- Use feature-based folder structure
- Keep components small and focused
- Use TypeScript for type safety
- Follow React best practices (hooks, composition)
- Maintain consistent naming conventions

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options

- **Vercel** - Recommended for React apps
- **Netlify** - Easy deployment with CI/CD
- **AWS S3 + CloudFront** - Scalable static hosting
- **GitHub Pages** - Free hosting for public repos

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🔗 Links

- [Documentation](Architecture%20plan/)
- [Issues](https://github.com/yourusername/sales-copilot/issues)
- [Discussions](https://github.com/yourusername/sales-copilot/discussions)

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

</div>
