# Enterprise Risk Management (GRC) Module Specification

## 1. Overview
This document serves as the architectural and functional specification for the Enterprise Risk Management (GRC) Module. It is designed based on enterprise-level benchmarks to integrate seamlessly with a broader full-stack GRC suite.

The platform relies heavily on **Multi-Tenancy** (via `projectId`), **Component-Driven Development**, and **Defensive Data Models** tailored for compliance audits (e.g., SOC2).

## 2. Architectural Principles
- **Data-First Design:** Strict adherence to data boundaries. Every entity is tied to a `projectId` to ensure tenant isolation.
- **Component-Driven UI:** Reusable micro-components (e.g., Threat feeds, Risk badges, Metric trackers).
- **Extensible API Layer:** The `/src/api/client.ts` acts as a proxy/contract for real backend REST endpoints.
- **Security & Auditability:** Immutable state concepts, soft deletes, and audit trails are anticipated for backend implementation.

## 3. UI/UX Structure (Based on Benchmark)

The application navigation and routing are split into three distinct strategic layers:

### A. Board Risk Oversight Layer
High-level visibility for executives and board members.
- **Dashboard:** Cross-portfolio aggregations, heatmaps, KRI status.
- **Risk Register:** Comprehensive ledger of all identified risks, impacts, and treatment plans.
- *(Planned)* **Issue & Loss Tracker:** Links incidents, near-misses, and control failures.
- *(Planned)* **Board Risk Pack:** Converts risk metrics into executive-ready breach summaries.

### B. Risk Governance Toolsets
Proactive alignment and limit setting methodologies.
- **Strategy Alignment:** Links objectives, exposure choices, and performance decisions.
- **Risk Appetite & Tolerance:** Converts broad risk capacity into limits, thresholds, and escalation rules.
- **Emerging Risk Radar:** Scans external signals (Geopolitical, Regulatory, AI, Climate).
- *(Planned)* **Scenario & Stress Testing, Enterprise Risk Portfolio, Financial Risk, Reputation Risk.**

### C. Risk Control Toolsets
Operational management of specific threat domains.
- **Cyber & Data Risk:** Identity compromise, ransomware readiness, cloud dependencies, threat intelligence.
- **AI & Model Governance:** Model inventory, hallucination rates, bias control, human oversight metrics.
- **Controls Register:** Effectiveness testing, exceptions, root causes.
- *(Planned)* **Third Party, Operational Resilience, Regulatory Change, Climate/Sustainability.**

## 4. Core Data Schema (TypeScript Interfaces)

Located in `/src/types/grc.ts`.

### Multi-Tenancy Base
All models strictly implement the tenant boundary:
```typescript
{
  projectId: string; // Tenant Isolation
  id: string; // UUID Primary Key
  createdAt: string;
  updatedAt: string;
}
```

### Key Entities
1. **Risk:** Core entity. Tracks `inherentLikelihood`, `inherentImpact`, `residualLikelihood`, `residualImpact`, `status`, and `owner`.
2. **Control:** Mitigating mechanisms. Tracks `type` (Preventative, Detective, Corrective), `effectiveness`, and links via `riskIds`.
3. **Issue:** Incidents or control failures. Maps specifically to `relatedRiskId` or `relatedControlId` to show cascading impact.
4. **KRI (Key Risk Indicator):** Metrics that track risk velocity. Includes `currentValue`, `warningThreshold`, and `criticalThreshold`.

## 5. API Integration Contract
The target backend REST architecture assumes:
- `GET /api/v1/projects/:projectId/<resource>`
- `POST /api/v1/projects/:projectId/<resource>`
- `PUT /api/v1/projects/:projectId/<resource>/:id`

The `ApiClient` acts as a facade, ensuring front-end code remains completely isolated from the fetching implementation details (Axios/Fetch). Load states, error boundaries, and API-failure fallbacks must wrap all connected components.

## 6. Future Implementation Roadmap
1. **Audit Logs:** Add immutable SOC2-compliant logging UI for 'Risk Mitigation Plans'.
2. **URL Search Params:** Sync `projectId` and active filters to the URL (`?projectId=xyz123`) to support deep-linking for board members.
3. **Finish Remaining Matrix Modules:** Implement the remaining benchmark gaps (Third Party Risk, Climate Sustainability, Legal & Compliance).
4. **Backend Handoff:** Replace `mockRisks` and simulated network latency with the actual GRC Suite API hooks.
