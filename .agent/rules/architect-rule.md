---
trigger: model_decision
description: A YAML frontmatter describing the project context: Architecture Map, Tech Stack Overview, Strict Security/Execution Policy, Coding Standards.
---

# CLEC Strategy Backtest - Workspace Rules (Google Antigravity)

This project is a high-performance financial backtester for investment strategies (e.g., QQQ/QLD leverage strategies).

## 🚀 Tech Stack

- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React
- **Mobile**: Capacitor (Android/Core)
- **Charts**: Recharts
- **PDF Generation**: jspdf, jspdf-autotable, html2canvas
- **Testing**: Vitest

## 🏗️ Project Structure

- `/components`: UI components (ConfigPanel, ResultsDashboard, Modals)
- `/services`: Core logic
  - `simulationEngine.ts`: The heart of the backtester. Runs the monthly loop.
  - `strategies.ts`: Rebalancing strategies (Smart Adjust, Flexible Defensive/Aggressive).
  - `financeMath.ts`: Pure mathematical functions (CAGR, Sharpe, Ulcer Index).
  - `i18n.tsx`: Multi-language support (CN, EN, FR).
- `/docs`: Functional requirements and architecture guides.
- `/types.ts`: Centralized TypeScript interfaces.

## 🛡️ Strict Execution Rules (User Global Policy)

> [!IMPORTANT] > **NEVER** run `npm install`, `go build`, `pytest`, `cargo`, or any build/test commands directly on the host.

1. **Docker Only**: All compilation, testing, and dependency installation **MUST** use Docker.
   - Example: `docker run --rm -v $(pwd):/app -w /app [image] [command]`
2. **Build/Test**: Use `docker-compose up --build` for system-wide testing.
3. **No Global Installs**: Forbidden to use `npx`, `pip install -U`, `gem install`, etc.

## 💻 Coding Standards

- **Simulation Logic**: Any changes to `simulationEngine.ts` must maintain consistency with `financeMath.ts` formulas.
- **Strategies**: New strategies should be added to `strategies.ts` and registered in `getStrategyByType`.
- **UI/UX**: Follow the "Rich Aesthetics" principle. Use smooth transitions, premium color palettes (HSL), and micro-animations.
- **I18n**: Ensure all new UI strings are added to `services/i18n.tsx`.
- **Types**: Always update `types.ts` when modifying data structures.

## 🧪 Testing

- Core math and simulation logic should be verified via Vitest.
- Run tests via Docker: `docker-compose up --build` (verify `docker-compose.yml` includes a test service).
