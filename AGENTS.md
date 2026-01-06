# CLEC Strategy Backtest - Agent Guidelines

## Commands

**CRITICAL**: All compiling, testing, and building MUST run in Docker containers for consistency.

### Docker Commands (Required)

```bash
docker-compose up app          # Development server
docker-compose run test        # Testing (unit + E2E)
docker-compose run lint        # Linting and format checking
docker-compose up prod-test    # Production build
```

### Direct npm Commands (Local dev only)

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build (tsc + vite build)
npm run test         # Run all unit tests (Vitest)
npm run lint        # ESLint check
npm run format      # Format with Prettier
```

### Testing

```bash
npx vitest run financeMath.test
npx playwright test calculation.spec.ts
```

---

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode** enabled (no implicit any, strict null checks)
- ES2020 target, ESNext module resolution
- JSX runtime: `react-jsx` (no React import required)

### Formatting (Prettier)

- **No semicolons**
- **Single quotes** for strings
- **Trailing commas** everywhere
- **Line width**: 100 characters
- **Indentation**: 2 spaces

### Import Patterns

```typescript
import React, { useState } from 'react'
import { AssetConfig } from '../types'
import { calculateCAGR } from './financeMath'
```

### Naming Conventions

- **Variables/functions**: `camelCase`
- **Components**: `PascalCase` (export const NameComponent)
- **Interfaces/Types**: `PascalCase` (e.g., `AssetConfig`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_ASSET_CONFIG`)
- **Files**: `camelCase.ts` for services, `PascalCase.tsx` for components

### Type Annotations

- Explicit types for function parameters and return values
- Prefer interfaces for object shapes, type aliases for unions/literals
- No `any` usage (ESLint warns, prefer `unknown` with proper checks)

### React Patterns

- Functional components with hooks
- Use `React.FC<Props>` for typed components
- Props interfaces defined inline or before component
- Event handlers: `handleClick`, `handleChange`

### Testing

- Unit tests in `services/__tests__/` with `.test.ts` suffix
- E2E tests in `e2e/` with `.spec.ts` suffix
- Use `describe`/`it`/`expect` from `vitest`
- Test helpers: `createBaseConfig()`, `generateMarketData()` for setup

### Code Organization

```
services/              # Core business logic
  ├── simulationEngine.ts
  ├── strategies.ts
  ├── financeMath.ts
  └── __tests__/      # Unit tests

components/            # React UI components
  ├── ConfigPanel.tsx
  └── ResultsDashboard.tsx

types.ts              # Shared TypeScript interfaces
constants.ts          # Global configuration
```

### Numeric Precision

- Financial calculations: Use `toFixed()` for display, preserve full precision internally
- Percentages stored as decimal (0.5 for 50%), multiply by 100 for display
- Currency: Store as number, format with Intl.NumberFormat for display

### Strategy Implementation

- All strategies implement `StrategyFunction` signature
- Pure functions: input state, market data, config → output state
- Use `strategyMemory` in `PortfolioState` for multi-step strategies
- Preserve immutability: spread operator for state updates

### Date Handling

- Dates stored as ISO strings (`YYYY-MM-DD`)
- Use `substring(5, 7)` to extract month (1-12)
- Market data assumes monthly snapshots

---

## Quick Reference

### Adding a new test file

```bash
touch services/__tests__/newFeature.test.ts
# Add imports and tests
import { describe, it, expect } from 'vitest'
import { yourFunction } from '../yourModule'
```

### Adding a new strategy

1. Define function in `services/strategies.ts`
2. Add to `StrategyType` union in `types.ts`
3. Export from `strategies.ts`
4. Add tests in `services/__tests__/strategies.test.ts`

### Adding a new component

1. Create `components/NewFeature.tsx`
2. Define Props interface
3. Export as `export const NewFeature: React.FC<Props> = ({ ... }) => { ... }`
4. Add E2E test in `e2e/`

---

## Key Constraints

- **No `any` types** - use proper TypeScript typing
- **No semicolons** - Prettier enforces
- **Strict mode** - no implicit any, null checks required
- **Type safety** - all code must pass TypeScript compilation
- **Test coverage** - unit tests for all business logic
