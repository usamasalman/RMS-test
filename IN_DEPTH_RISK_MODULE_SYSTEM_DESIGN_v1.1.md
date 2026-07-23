# In-Depth System Design and Architecture
## Standalone + Integrated Enterprise Risk Management Module for GRC Wisdom

> **Revision Notice (v1.1) — Read Before Using This Document**
>
> This document was written before the actual repository (`grc-wisdom.zip`) was audited line-by-line against it. Three corrections below resolve real conflicts between what this document specifies and what the codebase actually contains. The rest of the document — entity model, NFRs, workflow state machines, phased delivery plan, ADR list — holds up well against the audit and is **not** changed; only the three sections below are.
>
> **1. Tech stack (§1, §7.3, §16, §19, §21) — corrected, not just flagged.** This document originally specified Django + DRF as the backend framework. The actual repo already contains a real, working Express/Node backend (`server.ts`) with genuine JWT issuance and a verified, live `/api/v1/auth/*` flow — the one piece of this system that is not a mock. Per `GRC_WISDOM_PRODUCTION_READINESS_SPEC.md` (the reconciliation document produced from direct repo audit), the target is **Express/Node, extended**, not Django, greenfield. §7.3, §16, and §19 below are rewritten to Node/Express equivalents. If a Django rewrite is genuinely preferred over extending the one component that already works end-to-end, that's a real decision with real cost (a second language/runtime, discarding working auth) and should be made explicitly — not inherited silently from this document's first draft.
>
> **2. Role taxonomy (§11.5) — corrected.** This document originally listed seven roles (Super Admin, Tenant Admin, Risk Manager, Risk Owner, Control Owner, Auditor, Executive) matching none of the role lists found elsewhere in the project: not the `Role` type in code (`Admin | CRO | Risk Owner`), not what `server.ts` actually issues (`Administrator | Risk Owner | Auditor`), and not the six-role matrix already finalized in the production readiness spec. §11.5 now points to that matrix as the single source of truth instead of stating an independent fourth list.
>
> **3. Current-state description (§18.1) — corrected.** Originally read "Frontend has rich domain/UI and mock/simulated API patterns" — true, but not specific enough to act on safely. The audit found **two incompatible parallel frontend systems** sharing one UI shell, not one set of mock patterns, and found the asset-register ingestion feature — the product's core differentiator — doesn't simulate extraction so much as fabricate a false success message about work it never did. §18.1 is rewritten below with these specifics.
>
> Everything else here — the entity model in §9, the NFRs in §5, the workflow state machines in §12, the phased plan in §20, the ADRs in §21 apart from the framework choice — was written independently of the repo and aligns well with it on direct comparison. That stands as written.

## 1) Document Purpose

This document defines the full system design for an enterprise-grade Risk Management Module that can:

1. Operate as a **standalone product** for customers who only buy risk management.
2. Operate as a **core integrated domain** inside the broader GRC Wisdom suite.

The design is intended to move the current MVP/prototype frontend into a production-ready, secure, scalable backend architecture using **Express (Node.js/TypeScript)**, **PostgreSQL**, **Docker**, and **JWT authentication**, extending the existing working `server.ts` foundation rather than rebuilding the API layer in a second language. *(Originally specified as Django/Python — see Revision Notice above.)*

---

## 2) Business Goals and Product Positioning

### 2.1 Business Goals
- Deliver a commercially viable **risk-only offering** with enterprise controls.
- Preserve compatibility with full-suite GRC workflows.
- Support multi-tenant B2B deployment (one platform, many client organizations).
- Enable future regulated-market readiness (SOC 2, ISO 27001 alignment path).

### 2.2 Product Modes
- **Mode A: Standalone Risk Product**
  - Provides risk register, controls, KRIs, issues/incidents, appetite/tolerance, reporting.
  - Uses its own auth, users, roles, API, and data boundaries.
- **Mode B: Integrated GRC Wisdom Module**
  - Same backend domain capabilities.
  - Embedded into suite navigation, shared identity (or federated SSO), shared reporting.

### 2.3 Key Stakeholders
- Board / Executive leadership
- Chief Risk Officer / Risk Manager
- Risk Owner / Control Owner
- Compliance / Internal Audit
- Security and AI governance teams

---

## 3) Scope and Non-Goals

### 3.1 In Scope (Phase 1 to Production)
- Risk register lifecycle (inherent/residual/target residual).
- Control library, control mapping, control testing, control failures/weaknesses.
- KRI definitions, thresholds, signal/breach tracking.
- Issue/incident/near miss/loss event lifecycle.
- Appetite/tolerance/capacity model and breach escalation.
- Role-based access control and tenant isolation.
- Immutable audit logs and evidence metadata.
- API-first architecture for both standalone UI and suite integration.

### 3.2 Out of Scope for Initial Production Cut
- Full workflow BPM engine.
- Full GRC legal/regulatory corpus ingestion.
- Climate and advanced quant models (scenario/stress Monte Carlo engine).
- Cross-region active-active distributed writes.

---

## 4) Functional Requirements

### 4.1 Risk Domain
- Create/update/archive risks with taxonomy and ownership.
- Track:
  - Inherent risk
  - Residual risk
  - Target residual risk
- Link risks to controls, assets, processes, third parties, and obligations.
- Maintain risk status transitions with approval gates.

### 4.2 Controls Domain
- Maintain control inventory (preventive/detective/corrective).
- Map controls to one or multiple risks.
- Perform control tests with pass/fail and evidence references.
- Capture control weakness/failure and related incidents/issues.

### 4.3 Metrics and Indicators
- Define KRIs and thresholds (warning/critical).
- Ingest periodic values and calculate breach state.
- Trigger notifications/escalation when tolerance breaches occur.

### 4.4 Incidents, Issues, Loss
- Log incidents and near misses.
- Track issue remediation and ownership.
- Capture loss events with impact and recoverability metadata.

### 4.5 Appetite/Tolerance/Capacity
- Configure appetite statements by category.
- Convert tolerance to measurable boundaries.
- Evaluate risks and KRIs against those boundaries.

### 4.6 Reporting
- Portfolio heatmaps, trend charts, breach dashboards.
- Export board-ready summaries.
- Evidence-ready extracts for audit.

---

## 5) Non-Functional Requirements (NFRs)

### 5.1 Availability
- Target: 99.9% monthly for API in production.

### 5.2 Performance
- P95 read latency: < 300ms for standard list/detail endpoints.
- P95 write latency: < 500ms for typical mutations.
- Support at least 200 concurrent active users per tenant in baseline sizing.

### 5.3 Scalability
- Horizontal scaling at app tier.
- Read replicas for analytics/report-heavy use cases.
- Queue-based async tasks for expensive operations.

### 5.4 Security
- JWT HS256 with secure key management and rotation.
- RBAC + tenant scoping at every query path.
- Encryption in transit (TLS), secure credential handling, audit logging.

### 5.5 Compliance and Auditability
- Immutable audit records for sensitive entity changes.
- Traceability from risk decision to controls/tests/issues.
- Retention and archival strategy.

### 5.6 Maintainability
- Bounded modules in the API service (see §7.3).
- API versioning.
- Migration-safe schema evolution.

---

## 6) Terminology Model (Aligned with Your Risk Language)

The module explicitly supports and standardizes these concepts:
- Risk appetite
- Risk tolerance
- Risk capacity
- Inherent risk
- Residual risk
- Target residual risk
- Risk owner
- Control owner
- Control failure
- Control weakness
- Issue
- Incident
- Near miss
- Loss event
- KRI signal
- Performance indicator
- Regulatory obligation
- Compliance gap
- Third-party reliance
- Resilience risk
- Attack path
- Data quality risk
- Model risk
- AI governance risk
- Privacy risk
- Conduct risk
- Transition risk
- Geopolitical risk
- Systemic risk

This vocabulary should be represented in:
1. data taxonomy tables,
2. API payload enums/lookup endpoints,
3. UI labels and filters,
4. governance reporting templates.

---

## 7) High-Level Architecture (C4-style)

### 7.1 Context Level
- Users interact through:
  - Standalone Risk UI
  - Integrated GRC Wisdom UI
- Both consume the same Risk Management API platform.
- Optional integrations:
  - Identity provider (SSO later phase)
  - Notification channels (email/Slack)
  - BI/reporting systems

### 7.2 Container Level
- **Frontend Container**: SPA (existing React app, risk pages).
- **API Container**: Express (Node.js/TypeScript) — risk services, extending `server.ts`.
- **Worker Container**: Celery/RQ for async jobs.
- **Database Container**: PostgreSQL.
- **Cache/Queue Container**: Redis.
- **Ingress Container**: Nginx/Traefik (TLS termination, routing, rate limits).

### 7.3 Component Level (inside the API service)
*(Originally specified as Django apps; rewritten as Express/Node modules — see Revision Notice.)*
- `auth` module: JWT issue/refresh/revoke, user/session policy. Extends `server.ts`'s existing `/api/v1/auth/*` routes rather than replacing them.
- `tenancy` module: tenant, project/workspace boundaries, enforced via PostgreSQL Row-Level Security, not query-time filtering alone.
- `rbac` module: roles, permissions, role assignments — single source of truth shared by frontend and backend (see §11.5).
- `risk` module: risk register and scoring. Extends `server.ts`'s existing (currently unused by the frontend) `/api/v1/risks` routes.
- `controls` module: controls/tests/failures/weaknesses.
- `events` module: issues/incidents/near misses/losses.
- `metrics` module: KRIs and indicator observations.
- `governance` module: appetite/tolerance/capacity, obligations.
- `audit` module: immutable change logs and access logs.
- `reporting` module: board packs and exports.

---

## 8) Deployment Architecture

### 8.1 Environments
- Local dev (docker compose)
- Shared dev
- Staging
- Production

### 8.2 Runtime Topology (MVP Production)
- 2+ Express API replicas behind load balancer.
- 1+ worker process group.
- PostgreSQL primary + optional read replica.
- Redis for cache + async queue.
- Object storage for evidence attachments metadata links.

### 8.3 Network and Security Zones
- Public zone: HTTPS ingress only.
- Private app zone: Express API/worker.
- Data zone: PostgreSQL/Redis not public.
- Strict firewall/security group rules.

---

## 9) Data Architecture and Domain Model

### 9.1 Multi-Tenant Strategy

Recommended initial strategy:
- **Single PostgreSQL database**
- Shared tables with mandatory `tenant_id`
- Composite unique constraints include `tenant_id`
- Query middleware enforces tenant filter

Benefits:
- Fast rollout, lower operational complexity.

Future option:
- Per-tenant database for regulated premium clients.

### 9.2 Core Entities

#### Base Columns (most domain tables)
- `id` (UUID)
- `tenant_id` (UUID)
- `created_at`, `updated_at`
- `created_by`, `updated_by`
- `version` (optimistic locking)
- `is_deleted` (soft delete where required)

#### Identity and Access
- `tenant`
- `user`
- `role`
- `permission`
- `user_role`

#### Risk and Taxonomy
- `risk`
- `risk_category`
- `risk_tag`
- `risk_owner_assignment`

#### Controls
- `control`
- `risk_control_link`
- `control_test`
- `control_failure`
- `control_weakness`

#### Appetite and Thresholds
- `risk_appetite_profile`
- `risk_tolerance_limit`
- `risk_capacity_limit`
- `appetite_breach_event`

#### KRIs and Signals
- `kri_definition`
- `kri_observation`
- `kri_signal_event`

#### Operational Events
- `issue`
- `incident`
- `near_miss`
- `loss_event`

#### Asset and Dependency
- `asset`
- `asset_risk_link`
- `third_party`
- `third_party_risk_link`
- `attack_path`

#### Governance and Compliance
- `regulatory_obligation`
- `compliance_gap`
- `evidence_reference`

#### Audit
- `audit_log` (append-only)
- `access_log`

### 9.3 Data Integrity Rules
- No cross-tenant FK references.
- Risk cannot transition to `Closed` with open critical treatment actions.
- Control test requires linked control and tester identity.
- Loss event requires source incident or explicit standalone classification.

### 9.4 Indexing Strategy
- Index `(tenant_id, updated_at DESC)` for major listing tables.
- Index frequent filters:
  - risk status/category/owner
  - control status/type
  - KRI threshold breach state
- Use partial indexes for active/non-deleted records.

### 9.5 Partitioning
- Plan partition for high-volume append tables (`audit_log`, `kri_observation`) by month/quarter once volume justifies it.

---

## 10) API Design

### 10.1 API Principles
- RESTful JSON, versioned as `/api/v1`.
- Idempotency key for critical POST operations.
- Cursor-based pagination for list endpoints.
- Strict request validation + standardized error envelope.

### 10.2 Endpoint Grouping (Examples)
- `/api/v1/auth/*`
- `/api/v1/tenants/*`
- `/api/v1/risks/*`
- `/api/v1/controls/*`
- `/api/v1/kris/*`
- `/api/v1/incidents/*`
- `/api/v1/issues/*`
- `/api/v1/loss-events/*`
- `/api/v1/appetite/*`
- `/api/v1/reports/*`
- `/api/v1/audit/*`

### 10.3 API Security Behavior
- Access token required on protected endpoints.
- Tenant ID from token claim, not trusted from request body.
- Role-based permission checks per route + object-level checks.

### 10.4 Error Model
- `400` validation errors with field map.
- `401` auth failures.
- `403` permission denied.
- `404` resource not found (within tenant scope).
- `409` conflict (state transitions, optimistic lock).
- `429` rate limit.
- `500` unexpected server error with trace ID.

---

## 11) Authentication, Authorization, and Cryptography

### 11.1 JWT Strategy
- Access token (short-lived, 5-15 min).
- Refresh token (long-lived, 7-30 days, rotatable).
- Claims:
  - `sub` user ID
  - `tenant_id`
  - `roles`
  - `iat`, `exp`, `jti`

**Current-state gap (verified against `server.ts`):** today's implementation issues a single 24-hour token carrying `{id, email, role, name}` — no `tenant_id` claim, no refresh token, no rotation. This is a real gap from the target above, not a minor one: adding `tenant_id` to the claim is meaningless until the database has a tenant column to scope it against, so this work lands together with the RLS migration (§9.1), not before it.

### 11.2 Token Lifecycle
- Login: issue access + refresh.
- Refresh: validate refresh, rotate token, revoke old token.
- Logout: revoke refresh token family (or active token entry).

### 11.3 Key Management
- Use separate strong secret for JWT signing.
- Store in secure secret manager/environment vault.
- Rotation plan:
  - staged overlap window for old+new keys if implementing key IDs.

### 11.4 Password Security
- Argon2 preferred (or PBKDF2 with strong parameters).
- Password policy + optional MFA roadmap.

### 11.5 Authorization Model
*(Originally listed an independent role taxonomy here — see Revision Notice.)*
- Role-based baseline: the canonical six-role matrix is defined once in `GRC_WISDOM_PRODUCTION_READINESS_SPEC.md` §4 (Administrator, CRO/Executive, Risk Owner, Compliance Officer, Internal Auditor, Read-Only/Board Viewer) and is the single source of truth for this system. It is not restated independently here to avoid a fifth disagreeing list — implementers should read that matrix, not infer roles from this section.
- Optional attribute constraints:
  - region/business-unit data scope.

### 11.6 Data Protection
- TLS everywhere external.
- Sensitive fields encrypted at rest where needed.
- Strict audit trail for privilege changes and high-risk actions.

---

## 12) Workflow and State Machines

### 12.1 Risk Lifecycle State Machine
- Draft -> Open -> Assessed -> Treatment In Progress -> Monitoring -> Closed
- Reopen allowed with reason and audit entry.

### 12.2 Control Lifecycle
- Draft -> Designed -> Implemented -> Operating -> Retired
- Failure triggers:
  - issue creation,
  - potential risk score reevaluation.

### 12.3 Issue Lifecycle
- Open -> Triaged -> In Remediation -> Validated -> Closed

### 12.4 Incident Lifecycle
- Reported -> Investigating -> Contained -> Recovered -> Postmortem Closed

### 12.5 Appetite Breach Workflow
- Detect breach from risk/KRI against thresholds.
- Auto-create breach event.
- Notify owner + escalate by policy.
- Require action plan and due date.

---

## 13) Eventing, Async Processing, and Notifications

### 13.1 Async Use Cases
- Report generation (PDF/XLSX).
- Batch import/export.
- Scheduled KRI recalculations.
- Notification fanout.

### 13.2 Queue Design
- Redis-backed queue (Celery or RQ).
- Retry policy with dead-letter queue approach.

### 13.3 Notification Channels
- In-app notifications
- Email
- Optional Slack webhook connector

---

## 14) Observability and Operational Excellence

### 14.1 Logging
- Structured JSON logs.
- Correlation/trace ID propagated across requests/jobs.
- Redact secrets/PII.

### 14.2 Metrics
- API latency, error rate, throughput.
- Queue depth, worker success/failure.
- DB query latency and lock wait metrics.

### 14.3 Tracing
- Distributed traces for API + DB + async tasks.

### 14.4 Alerting
- SLO-based alerts:
  - 5xx spike
  - latency degradation
  - DB saturation
  - auth anomalies

---

## 15) Reliability, Backup, and Disaster Recovery

### 15.1 Backup Strategy
- Daily full backups + frequent WAL archiving.
- Defined RPO/RTO targets:
  - MVP target RPO <= 15 min
  - MVP target RTO <= 2 hours

### 15.2 Disaster Recovery
- Infrastructure as code for rebuild.
- Regular restore drills.

### 15.3 Fault Handling
- Graceful degradation for non-critical features.
- Circuit breaker/retry for external integrations.

---

## 16) DevSecOps and SDLC

### 16.1 Git and Release Strategy
- Trunk-based with protected main branch.
- Feature flags for incomplete modules.

### 16.2 CI Pipeline
- Lint + type checks + tests + SAST. *(The repo already has a working `tsc --noEmit` lint script — this is the one piece of §16 that's extension, not greenfield. Note: today this passes clean despite the `currentRole: string` type-widening issue documented in the production readiness spec §1.4 — tightening that type so the compiler can catch role drift again should be an early CI-pipeline win, not a deferred one.)*
- Build Docker image and sign artifact.
- Migration checks in staging before prod promotion.

### 16.3 CD Pipeline
- Blue/green or rolling deployment.
- Health checks and automated rollback gates.

### 16.4 Security in Pipeline
- Dependency scanning.
- Secret scanning.
- Container image scanning.

---

## 17) Testing Strategy

### 17.1 Test Layers
- Unit tests (domain logic, scoring, permissions).
- API contract tests (OpenAPI conformance).
- Integration tests (DB and queue interactions).
- End-to-end tests (critical user journeys).

### 17.2 Critical E2E Journeys
- Login -> create risk -> link controls -> run control test -> trigger KRI breach -> escalate -> close issue.
- Tenant isolation proof tests.
- Permission boundary tests.

### 17.3 Performance and Security Testing
- Load tests for key endpoints.
- Token abuse and authorization bypass tests.
- SQL injection and insecure object reference checks.

---

## 18) Data Migration and Current MVP Transition Plan

### 18.1 Current State
*(Rewritten from the repo audit — see Revision Notice. Original text: "Frontend has rich domain/UI and mock/simulated API patterns. Backend contracts are partially represented in client abstraction." That's accurate as far as it goes; the detail below is what makes it actionable.)*

- **Two incompatible parallel frontend systems exist side by side**, sharing one UI shell with no visual or architectural seam between them. "System B" (`src/store/DataContext.tsx`, `src/types/index.ts`) powers Risk Register, Risk Detail, Dashboard, Asset Register, Control Library, Treatment Monitor — the features matching the actual product. "System A" (`src/api/client.ts`, `src/types/grc.ts`) powers six other routed pages (Strategy Alignment, Risk Appetite, Emerging Risks, Cyber Risk, AI Risk, Reports View) and should be retired outright, not migrated — see `GRC_WISDOM_PRODUCTION_READINESS_SPEC.md` §0 for the full reasoning.
- **A real, working backend already exists** for one feature: `server.ts` issues genuine JWTs and `AuthContext.tsx` makes real `fetch()` calls against it. This is the one piece of "backend contracts partially represented" that's actually further along than "partial" — it's the starting point to extend, not rebuild.
- **`server.ts` also already defines `/api/v1/risks` routes**, JWT-protected, with a basic RBAC check — and the frontend calls none of them. This is unconnected real infrastructure, not missing infrastructure.
- **The asset-register ingestion feature — the product's stated core differentiator — does not function.** File upload never reads the file; it inserts two hardcoded records after a timed delay and displays a fabricated success message claiming extraction occurred. This is a higher-priority fix than generic "mock data" framing would suggest, because the false success message is itself a credibility risk independent of the missing functionality.

### 18.2 Migration Strategy
1. **Retire System A first**, before any backend work begins — delete `src/api/client.ts`, `src/types/grc.ts`, and the six pages it powers, or formally archive them outside the active tree. Doing this before Phase 0 below prevents the (otherwise live) risk of an agent or engineer extending the wrong half of the codebase.
2. Establish the API skeleton extension (auth/tenancy/rbac) on top of the existing `server.ts`, not a fresh framework — see §1 and §7.3.
3. Implement risk + controls + KRI + issue domains, wiring System B's existing `useData()` hook contract to real queries rather than changing its call sites.
4. Replace the asset register's fabricated extraction handler with real file parsing (the repo's existing `exceljs` dependency is unused for this and is the natural starting point) before introducing any AI/SLM ingestion layer on top of it.
5. Introduce a data import pipeline for any genuinely useful existing demo datasets, after first removing the cybersecurity-tabletop-exercise mock seed data currently in `DataContext.tsx`, which is unrelated to GRC risk register content and references at least one named real company.
6. Switch frontend API client by feature flag endpoint routing.
7. Decommission mock context writes after cutover.

### 18.3 Integration Modes During Transition
- Dual-write is optional but not preferred initially.
- Prefer backend-source-of-truth per module cutover.

---

## 19) Module Decomposition for Engineering Teams

*(Team boundaries below are unchanged from the original draft and remain reasonable. One grounding note: Team A's "Auth" scope is not a from-zero build — `server.ts`'s JWT issuance is real and working today; Team A's actual starting task is extending it with refresh-token rotation and a `tenant_id` claim per §11.1, plus building the tenancy/RBAC layers that don't yet exist, rather than standing up authentication from nothing.)*

### Team A: Platform and Security
- Auth, RBAC, tenancy, audit, shared middleware.

### Team B: Risk and Controls
- Risk register, scoring, controls, tests, failures.

### Team C: Operational Events and Metrics
- Issues/incidents/loss, KRIs, thresholds, escalation.

### Team D: Reporting and Integrations
- Executive dashboards, exports, notifications, suite integration APIs.

---

## 20) MVP-to-Production Phased Delivery Plan

### Phase 0 (2-3 weeks): Foundations
- Retire System A (delete `src/api/client.ts`, `src/types/grc.ts`, and the six pages it powers) before any of the below begins — see §18.2 step 1.
- Express API project setup (extending `server.ts`), PostgreSQL schema baseline, Docker compose.
- JWT auth + tenant model + RBAC scaffold.

### Phase 1 (4-6 weeks): Core Risk MVP
- Risk register CRUD, lifecycle, scoring.
- Controls and risk-control mapping.
- Basic audit logs.

### Phase 2 (3-4 weeks): Governance and Signals
- Appetite/tolerance/capacity.
- KRIs and breach detection.
- Issues/incidents/loss events.

### Phase 3 (3-4 weeks): Production Hardening
- Performance tuning, caching, background workers.
- Observability, backup/restore drills, security hardening.
- UAT and go-live readiness.

### Phase 4 (post go-live): Enterprise Expansion
- SSO/SAML, advanced reporting, stress testing, third-party risk depth, regulatory workflows.

---

## 21) Key Architectural Decisions (ADR Summary)

1. **Express (Node.js/TypeScript)** for the API layer, extending the existing working `server.ts` rather than introducing a second framework and runtime. *(Originally recorded as "Django + DRF for fast domain delivery and secure API scaffolding" — corrected per the Revision Notice. The original reasoning, fast and secure scaffolding, is better served by extending real working code than by a parallel rebuild that discards the one component already proven end-to-end.)*
2. **PostgreSQL** as system of record for relational risk-control-governance data.
3. **JWT HS256** for stateless API auth with controlled refresh lifecycle.
4. **Shared DB with tenant_id** first, with future path to tenant-dedicated deployments.
5. **Dockerized deployment** for consistency and environment parity.
6. **API-first integration** so standalone and suite use the same backend contracts.

---

## 22) Risks and Mitigations

### Risk: Cross-tenant data leakage
- Mitigation: tenant-aware repository pattern + mandatory middleware + automated tests.

### Risk: Authorization complexity growth
- Mitigation: centralized permission matrix, object-level checks, policy tests.

### Risk: Performance bottlenecks in reporting
- Mitigation: async report jobs, pre-aggregations, read replicas.

### Risk: Token compromise
- Mitigation: short token TTLs, refresh rotation, anomaly monitoring, forced logout controls.

### Risk: Model drift between frontend and backend
- Mitigation: OpenAPI contracts, generated client types, strict contract tests.

---

## 23) Minimum Production Readiness Checklist

- [ ] JWT auth and refresh rotation implemented and tested.
- [ ] Tenant isolation tests passing for all entity endpoints.
- [ ] RBAC matrix documented and enforced.
- [ ] Immutable audit log available for sensitive operations.
- [ ] Backup/restore drill completed successfully.
- [ ] Observability dashboard with SLO alerts live.
- [ ] Security scans and dependency checks clean or risk-accepted.
- [ ] Load test meets P95 targets.
- [ ] Incident response runbook and on-call ownership defined.

---

## 24) Recommended Next Deliverables

1. Detailed ERD (table-by-table with keys/indexes/constraints).
2. OpenAPI v1 contract document.
3. RBAC permission matrix spreadsheet.
4. Threat model (STRIDE) and data classification matrix.
5. Production runbook and SRE SOP package.

---

## 25) Final Architecture Statement

The target platform is a **multi-tenant, API-first, enterprise risk management system** designed for dual commercial operation: standalone sale and full-suite GRC integration. By extending the existing Express (Node.js/TypeScript) foundation with PostgreSQL and Docker under strict tenancy, RBAC, immutable auditability, and risk-governance workflows aligned to executive language (appetite/tolerance/capacity, inherent/residual, KRI, incidents/losses), this design provides a credible path from MVP to production while preserving extensibility for broader GRC domains. *(Originally read "implementing Django + PostgreSQL + Docker" — corrected per the Revision Notice; the substance of the statement, what gets built and why, is unchanged, only the framework.)*
