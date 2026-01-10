# Frontend Architecture - Feature-Based Structure

## Overview

The frontend follows a **feature-based architecture** with a **shared package** for common code. This structure promotes:

- **Modularity**: Each feature is self-contained
- **Scalability**: Easy to add new features
- **Reusability**: Shared code in packages
- **Maintainability**: Clear separation of concerns

## Project Structure

```
apps/web/
├── src/
│   ├── features/              # Feature modules
│   │   ├── email/
│   │   │   ├── components/   # Email-specific components
│   │   │   ├── hooks/        # Email-specific hooks
│   │   │   ├── pages/        # Email pages
│   │   │   ├── services/     # Email API services (future)
│   │   │   ├── types/        # Email-specific types (future)
│   │   │   └── index.ts      # Feature exports
│   │   ├── campaigns/
│   │   ├── dashboard/
│   │   └── templates/
│   ├── shared/               # Shared app code
│   │   ├── components/       # Shared components (Layout, etc.)
│   │   ├── hooks/            # Shared hooks (future)
│   │   └── utils/            # App-specific utils (future)
│   ├── App.tsx
│   └── main.tsx
│
packages/
└── shared/                   # Shared package (monorepo)
    ├── src/
    │   ├── types/            # Shared TypeScript types
    │   ├── utils/            # Shared utility functions
    │   ├── constants/        # Shared constants
    │   └── index.ts
    └── package.json
```

## Feature Structure

Each feature follows this structure:

```
features/email/
├── components/          # Feature-specific components
│   ├── RichTextEditor.tsx
│   ├── CopilotPanel.tsx
│   ├── ProspectInsights.tsx
│   ├── CompanyTechStack.tsx
│   ├── SpamScore.tsx
│   └── index.ts        # Component exports
├── hooks/              # Feature-specific hooks
│   ├── useEmailDraft.ts
│   └── index.ts
├── pages/              # Feature pages
│   └── EmailComposer.tsx
├── services/           # API services (future)
├── types/              # Feature-specific types (future)
└── index.ts            # Feature public API
```

## Shared Package

The `@lumina/shared` package contains:

### Types (`packages/shared/src/types/`)
- `User`, `Prospect`, `Company`
- `EmailDraft`, `Email`
- `SpamScore`, `AISuggestion`

### Utils (`packages/shared/src/utils/`)
- `formatDate`, `formatDateTime`
- `truncate`, `debounce`
- `generateId`

### Constants (`packages/shared/src/constants/`)
- `ROUTES` - Application routes
- `EMAIL_STATUS` - Email status constants
- `SPAM_SCORE_THRESHOLDS` - Spam score thresholds
- `API_ENDPOINTS` - API endpoint paths

## Import Patterns

### From Shared Package
```typescript
import { ROUTES, SPAM_SCORE_THRESHOLDS } from '@lumina/shared/constants'
import { Prospect, EmailDraft } from '@lumina/shared/types'
import { formatDate, debounce } from '@lumina/shared/utils'
```

### From Features
```typescript
import { EmailComposer } from '@/features/email'
import { Dashboard } from '@/features/dashboard'
```

### From Shared Components
```typescript
import { Layout, Header, Sidebar } from '@/shared/components'
```

## Adding a New Feature

1. **Create feature directory**:
   ```
   features/new-feature/
   ├── components/
   ├── hooks/
   ├── pages/
   └── index.ts
   ```

2. **Export from feature**:
   ```typescript
   // features/new-feature/index.ts
   export { default as NewFeaturePage } from './pages/NewFeaturePage'
   export * from './components'
   ```

3. **Add route in App.tsx**:
   ```typescript
   import { NewFeaturePage } from '@/features/new-feature'
   ```

## Benefits

1. **Feature Isolation**: Each feature is independent
2. **Easy Navigation**: Find code by feature, not by type
3. **Team Collaboration**: Teams can work on different features
4. **Code Reuse**: Shared package prevents duplication
5. **Type Safety**: Shared types ensure consistency
6. **Scalability**: Easy to add new features without refactoring

## Future Enhancements

- Add `services/` folder in each feature for API calls
- Add `types/` folder in each feature for feature-specific types
- Add `store/` folder for feature-specific state management
- Add `utils/` folder in shared for app-specific utilities
- Add shared hooks in `shared/hooks/`
