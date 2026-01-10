# Lumina AI Sales Copilot

A modern AI-powered sales email copilot with glassmorphic UI design.

## Features

- 🎨 Modern glassmorphic UI with gradient backgrounds
- ✍️ Rich text email composer
- 🤖 AI-powered personalization
- 📊 Real-time spam score analysis
- 👤 Prospect insights panel
- 🏢 Company tech stack integration
- 📁 Feature-based architecture

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glassmorphic utilities
- **Icons**: Lucide React
- **Routing**: React Router v6

## Project Structure

```
src/
├── features/              # Feature modules
│   ├── email/            # Email feature
│   ├── campaigns/        # Campaigns feature
│   ├── dashboard/        # Dashboard feature
│   └── templates/        # Templates feature
├── shared/               # Shared code
│   ├── components/       # Shared components (Layout, Header, Sidebar)
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Shared utility functions
│   └── constants/       # Shared constants
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

The UI uses a glassmorphic design system with:
- Glass cards with backdrop blur
- Gradient backgrounds
- Smooth transitions and animations
- Modern color palette

## License

MIT
