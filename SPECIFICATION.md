# Next-Gen GRC Platform - System Specification

## Overview
The Next-Gen Governance, Risk, and Compliance (GRC) Platform is a modern, responsive, and interactive React (Vite/TypeScript) application designed for senior executives and risk managers. It integrates quantitative risk scoring with qualitative strategic alignment. The application is built using a component-driven architecture, favoring local context-based data storage for prototyping with clear hooks for backend integrations.

## Core Principles
- **Data-First Design**: Unified multi-tenant architecture with interconnected models for Risks, Controls, Treatments, and Strategy.
- **Interactive Dashboards**: All user interfaces are dynamic with create/update hooks (no static "slop").
- **Quantitative & Qualitative Synergy**: Combines hard metrics (Key Risk Indicators, Residual Scoring) with strategic objectives and emerging threats tracking.

## Technical Architecture
- **Framework**: React 18+ via Vite.
- **Language**: TypeScript (`.tsx`, `.ts`).
- **Styling**: Tailwind CSS (Utility-first), using Lucide React for consistent iconography.
- **State Management**: `React Context API` (`src/store/DataContext.tsx`) simulating a robust database.
- **Data Visualization**: `recharts` for Dashboards and KPI rendering.
- **API Simulation**: Uses `ApiClient` (`src/api/client.ts`) representing async fetching mapped to the context layer, easily substitutable with a physical backend (e.g., Firebase, Supabase).

## Module Interfaces & Routing

The layout provides a sidebar navigation menu grouping workflows logically:

1. **Enterprise View**
   - **Dashboard (`/dashboard`)**: Aggregates total inherent/residual risks, control effectiveness, and upcoming treatment milestones.
   - **Risk Register (`/risks`)**: Tabular tracking of identified risks showing progression from Open to Mitigated state using dynamic SVG/rechart pie charts.
   - **Control Library (`/controls`)**: Lists operational mitigations mapped against framework standards.
   - **Treatment Monitor (`/treatments`)**: Tracks action plans, percentage completion, and dependencies mitigating residual risks.

2. **Metrics & Indicators**
   - **Key Risk Indicators (`/kris`)**: Quantitative threshold tracking alerts.

3. **Strategic & Emerging (The "Next-Gen" Edge)**
   - **Strategy Alignment (`/strategy`)**: Links board objectives to potential risk exposures.
   - **Risk Appetite (`/appetite`)**: Defines dynamic thresholds limits across Categories.
   - **Emerging Risks (`/emerging`)**: Radar for capturing geopolitical or geoeconomic signals early.
   - **Cyber Risk (`/cyber`)**: Specialized view for Tracking Threat intelligence and data security posture.
   - **AI Risk (`/ai-risk`)**: Dedicated governance for internal AI initiatives (Hallucinations, Bias tracking).

## Data Schema (Entities)

`src/types/index.ts` / `src/types/grc.ts`
- **Risk**: `{ id, title, description, categoryId, likelihood, impact, cia_c, cia_i, cia_a, ... }`
- **Control**: `{ id, name, designEffectiveness, operatingEffectiveness, mapping ... }`
- **TreatmentPlan**: `{ id, riskId, owner, progress, targetDate ... }`
- **StrategyObjective**: `{ id, projectId, title, description, category, status }`
- **AppetiteStatement**: `{ id, projectId, statement, metricLabel, currentValue, limitValue, status }`
- **EmergingRiskSignal**: `{ id, projectId, title, description, category, impact }`
- **CyberThreatIntelligence**: `{ id, projectId, threat, dateReported, level }`

## Future Backend Migration Path
The mock `ApiClient` and `useData` context are structured symmetrically to table models. 
For production implementation via Cloud SQL or NoSQL stores:
1. Swap `DataContext` functions with real `fetch()` mutations.
2. Maintain DTO (Data Transfer Object) mappings returning strongly-typed models back up to the UX layer.
3. Keep standard React forms (e.g., `NewRisk`, `AddObjective`) tightly coupled with Zod/Yup validation layers.
