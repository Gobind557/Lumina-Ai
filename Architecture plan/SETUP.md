# Setup Guide - Lumina AI Sales Copilot Frontend

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Sidebar, Layout
│   │   └── email/           # Email composer components
│   ├── pages/               # Page components
│   ├── App.tsx              # Main app with routing
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Features Implemented

✅ Modern glassmorphic UI design
✅ Animated gradient backgrounds
✅ Email composer with rich text editor
✅ Copilot panel with:
   - Prospect insights
   - Company tech stack
   - Spam score gauge
✅ Responsive navigation sidebar
✅ Modern header with branding

## Design System

### Glassmorphic Components
- `.glass` - Light glass effect
- `.glass-strong` - Stronger glass effect
- `.glass-card` - Card with glass effect
- `.glass-card-strong` - Stronger card glass effect
- `.glass-nav` - Navigation glass effect

### Gradients
- Animated background gradient
- Gradient text utilities
- Gradient buttons

## Next Steps

1. Connect to backend API
2. Implement AI personalization
3. Add state management (Zustand)
4. Implement draft saving
5. Add email sending functionality
