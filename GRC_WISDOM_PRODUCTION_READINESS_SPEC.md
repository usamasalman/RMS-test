# GRC Wisdom — Production Readiness Specification v2.0

**Status:** Canonical. Supersedes `ENTERPRISE_GRC_SPEC.md` and `SPECIFICATION.md` in full.
**Basis:** Direct audit of `grc-wisdom.zip` (full repo, file-by-file), not aspirational description.
**Audience:** Usama (product owner), and any agent or engineer picking up implementation work.

---

## 0. Read This First — Why the Old Specs Are Retired, Not Merged

`ENTERPRISE_GRC_SPEC.md` and `SPECIFICATION.md` were not two descriptions of one prototype. They were accurate, independent descriptions of **two different implementations that exist side by side in the same repository** and have never been reconciled at the code level:

| | "System A" (described by ENTERPRISE_GRC_SPEC.md) | "System B" (described by SPECIFICATION.md) |
|---|---|---|
| Schema file | `src/types/grc.ts` | `src/types/index.ts` |
| Data layer | `src/api/client.ts` (`ApiClient`, `await delay(ms)`) | `src/store/DataContext.tsx` (`useState`) |
| Risk fields | `projectId`, `inherentLikelihood/Impact`, `residualLikelihood/Impact` | `likelihood`, `impact`, `cia_c/i/a` (no `projectId`) |
| `status` enum | `'Open' \| 'Mitigated' \| 'Closed' \| 'Draft'` | `'Open' \| 'In Progress' \| 'Closed' \| 'Under Review'` |
| Pages it powers | StrategyAlignment, RiskAppetite, EmergingRisks, CyberRisk, AIRisk, ReportsView | Dashboard, RiskRegister, RiskDetail, NewRisk, AssetRegister, ControlLibrary, TreatmentMonitor |
| Multi-tenancy | Application-layer `projectId` filter (weak, but present) | **None.** No tenant concept exists in this half of the app at all. |

Both run inside the same `<DataProvider>` in `App.tsx`, behind the same sidebar, with no visual or architectural seam. A user — or an agent — moving from `/risks` to `/ai-risk` crosses from System B to System A without anything indicating the data model, persistence story, or tenant model just changed underneath them.

**Decision made in this document: System A is retired. System B is the product.** Rationale:

1. System B powers the features that match the actual product narrative in use across this project — risk register, asset register, control library, treatment monitor, the IRS/CR/RRS scoring pipeline. System A's pages (Strategy Alignment, Risk Appetite, Emerging Risk Radar, Cyber Risk, AI Risk) read as scaffolding pulled from a generic enterprise-GRC benchmark template — they don't correspond to anything in the actual roadmap, the asset-register-driven ingestion story, or Peer Saheb's methodology.
2. Both systems are equally "unfinished" in implementation depth (both are mock arrays plus a thin facade), so retiring System A loses no real engineering investment — only file count.
3. Keeping both and "merging gradually" is how a third, worse hybrid schema gets created under deadline pressure. Pick one now, while the cost of doing so is six files, not sixty.

This is not a recommendation to revisit. It is the starting assumption for every section below. If System A's modules (Strategy Alignment, Risk Appetite, etc.) are wanted later, they get rebuilt against System B's schema and tenant model from scratch — not resurrected from `api/client.ts`.

---

## 1. What Actually Exists Today (Ground Truth)

This section states only what was verified by reading the code. Nothing here is inferred from file names or dependency lists.

### 1.1 Real and working
- **Authentication**: `server.ts` is a genuine Express server with real JWT signing (`jsonwebtoken`) and password verification. `AuthContext.tsx` makes real `fetch()` calls to `/api/v1/auth/login`, `/signup`, `/me`, `/profile`. This is the one place in the repo where "frontend calls backend" is literally true.
- **Scoring formulas**: `src/lib/risk-utils.ts` correctly implements the *shape* of Peer Saheb's three-stage pipeline as named functions: `computeInherentRiskScore` (IRS), `computeControlRating` + `computeResidualRiskScore` (CR → RRS), `computePostTreatmentRRS` (final stage). The math itself is a reasonable starting translation of the methodology.
- **Route structure**: `App.tsx`'s routing is sane and matches a real GRC IA — dashboard, risk register, risk detail, controls, treatments, KRIs, documents, reports, asset register, admin, profile, settings.
- **Component library**: `src/components/ui/` is a complete shadcn-derived component set (Tailwind v4, Radix-based). This is genuinely reusable and doesn't need rework.

### 1.2 Real infrastructure, disconnected
- `server.ts` defines `GET/POST /api/v1/risks` — JWT-protected, with a basic RBAC check (Auditors blocked from POST). **Nothing in the frontend calls these routes.** This is started work, not missing work — it needs to be connected, not invented.
- `src/lib/apiClient.ts` (axios-based) exists and is correctly configured (auth interceptor, 401 handling) but is imported by exactly one file, `src/services/riskService.ts`, which itself is not imported anywhere live in the routed application.

### 1.3 Confirmed non-functional, despite appearing functional
- **Asset Register ingestion** (`AssetRegister.tsx`, `handleFileUpload`): On file upload, the file is never read. A `setTimeout(2500)` fires, then two hardcoded assets are inserted — one literally named `Extracted Server from {file.name.substring(0,5)}`. The UI then displays `"Successfully extracted {n} assets from {file.name}"` — a fabricated success confirmation for work that did not happen. **This is the literal entry point of the product's core differentiator (asset-register-driven ingestion) and it currently does nothing.**
- **AI GRC Assistant chat** (`RiskDetail.tsx`, `handleSendMessage`): Returns one hardcoded string via `setTimeout(800)` regardless of user input. `@google/genai` is a real dependency in `package.json` and is imported by zero files anywhere in the repo.
- **Five other `setTimeout`-as-async patterns**: `Documents.tsx` (fake upload delay), `Profile.tsx` / `Settings.tsx` (fake save confirmation — these are arguably fine as-is once a real save call backs them, see §3.4), `AIRisk.tsx` (fake model registration).

### 1.4 Confirmed broken or silently inconsistent
- **Three incompatible role systems** coexist:
  - `types/index.ts`: `type Role = 'Admin' | 'CRO' | 'Risk Owner'`
  - `server.ts` (what login actually issues): `"Administrator" | "Risk Owner" | "Auditor"`
  - `RiskRegister.tsx`: checks `currentRole === 'Auditor'`, a value absent from the declared `Role` type
  - This works at runtime today only because `DataContextType` declares `currentRole: string` rather than `currentRole: Role` — the type was widened specifically far enough that the compiler can't catch the mismatch. `tsc --noEmit` (the actual lint script) passes clean despite this.
  - **Net effect**: the spec calls for a six-role RBAC matrix. Three roles are wired end-to-end, under inconsistent names, with type-level enforcement disabled at exactly the point that would have caught it.
- **No tenant isolation in System B at all.** Not weak — absent. `risks`, `controls`, `assets`, `treatmentPlans` are flat `useState` arrays with no `projectId`, `tenantId`, or organization concept anywhere in the type or the data. Two users today, logged in simultaneously, see the same in-memory array.
- **Scoring computed independently in four places** (`server.ts`, `Dashboard.tsx`, `RiskRegister.tsx`, `RiskDetail.tsx`), each re-deriving IRS/CR/RRS from raw fields on every render rather than reading a single computed-and-stored value. They currently agree by coincidence, not by construction.
- **`computePostTreatmentRRS` is dead code.** Defined, correctly named, never called. The third stage of the scoring pipeline that's supposed to be a core differentiator does not run anywhere in the product today.
- **Duplicate `Risk` type** across `types/index.ts` and `types/grc.ts` with incompatible `status` enums (resolved by §0's decision to retire System A, but flagging here as the concrete symptom).
- **Mock seed data in `DataContext.tsx`** is cybersecurity tabletop-exercise content (codes `EB-`/`IT-`/`OT-`, titles like "Shut Down the Grid," "Triton Analysis," "Boot2Root Drill"), not generic GRC risk register entries — and one entry explicitly references a named real company ("virtual ADNOC office"). Origin unknown. Must be replaced with clearly synthetic data regardless of origin, before any client-facing use, screenshot, or demo.
- **Orphaned dead file**: `src/pages/Reports.tsx` (71 lines, not imported anywhere — `ReportsView.tsx` is the live route). Not a bug, but should be deleted, not built on. Its content is informative: it lists 15 named report types (Risk Control Matrix, Appetite Breached, Departmental/Divisional Risk Summary, KRI Breached, Root Cause) that are the most specific reporting requirements found anywhere in the repo and should be carried forward as requirements input to §5, even though the file itself is discarded.

---

## 2. The Real Starting Point

Strip the framing and this is where the project actually is:

- One working authentication flow (frontend ↔ backend, real).
- One unused but real protected API route pattern to extend (`server.ts`'s risk endpoints).
- One correct-shaped, two-thirds-wired scoring engine (IRS, CR/RRS implemented and called; post-treatment defined and orphaned).
- One core differentiator feature (asset ingestion) that is 0% implemented and currently lies to the user about its own success.
- One RBAC system that exists in name across three disagreeing definitions and is enforced nowhere reliably.
- Zero tenant isolation in the half of the app that matters.
- Two complete, parallel, partially-built application halves sharing a UI shell, one of which this document retires.

This is not "polish a prototype." It's "decide the product is System B, throw away System A, then build the backend, scoring integrity, tenant isolation, and real ingestion that System B never had." That's a bigger job than "add a database," and the plan below is sized to that, not to the smaller job the framing of "production ready" might otherwise imply.

---

## 3. Target Architecture

### 3.1 Tenancy and data boundary
- PostgreSQL with Row-Level Security, per the existing roadmap (Month 1). This is correct and unaffected by anything above — it was already the right call, and §1.4's finding (System B has *no* tenant boundary, not even a weak one) makes it more urgent, not less.
- Every table gets `tenant_id`, enforced by an RLS policy keyed off the JWT claim set at session start — not by application code remembering to filter. The current pattern (a flat array with no tenant field) is the worst-case starting point for this, which is a feature: there's no legacy application-layer filtering logic to accidentally trust instead of the database boundary.
- The `projectId`-as-filter pattern from System A is explicitly **not** the model to extend, even though it superficially looks closer to "multi-tenant." It's the wrong layer for the guarantee a GRC platform needs to make.

### 3.2 Scoring engine
- All four `compute*` functions in `risk-utils.ts` move server-side and become the single source of truth. They are correct as written and don't need rewriting — they need to stop being called redundantly from three different frontend components and start being called once, on write, with the result persisted.
- `computePostTreatmentRRS` gets wired into the treatment-plan update path: whenever a `TreatmentPlan.progress` changes, recompute and store the post-treatment score against that risk. This is the change that actually closes the "third stage is dead code" gap — not a rewrite, a wiring fix.
- Frontend components (`Dashboard`, `RiskRegister`, `RiskDetail`) stop importing `risk-utils` for computation and instead read `inherentScore`, `residualScore`, `postTreatmentScore` directly off the risk record returned by the API. This is also what fixes the "identical donut charts" and "flat heatmap" symptoms already on record — they were flat because every page was computing from the same thin mock inputs independently; a single persisted, real, varied dataset fixes the visual symptom as a side effect of fixing the architectural one.

### 3.3 RBAC
- One canonical role enum, defined once, in one shared location (`packages/shared-types` if a monorepo split happens, or a single `src/types/roles.ts` otherwise), consumed by both frontend and backend from the same source.
- The six-role matrix from the existing implementation spec is the target; the migration path from today's three-role, three-spelling reality is: (1) fix the enum to be exhaustive and correctly spelled in one place, (2) make `currentRole`'s type `Role` again instead of `string` so the compiler catches drift going forward, (3) add the remaining three roles as real, enforced checks — not just login-form options — before claiming RBAC is implemented.
- RBAC enforcement moves server-side as the authoritative check (a frontend `isAuditor` boolean is a UI convenience, never a security boundary). `server.ts`'s existing pattern — `if (req.user.role === "Auditor") return res.status(403)` — is the right shape; it needs to be applied consistently across every mutating endpoint, not just risk creation.

### 3.4 Persistence
- Replace `DataContext.tsx`'s `useState` arrays with real queries against the Postgres backend, behind the existing `useData()` hook signature where possible — the hook interface itself (`risks`, `addRisk`, `updateRisk`, etc.) is a reasonable contract and callers don't need to change, only what's behind them.
- `Profile.tsx` and `Settings.tsx`'s existing `setTimeout`-as-confirmation pattern becomes correct once a real `PUT` call backs it — the UI/UX pattern (optimistic update, success toast, auto-dismiss) doesn't need to change, only what triggers it.
- `server.ts`'s in-memory `DB` object and its already-written `/api/v1/risks` routes are the literal starting point for this — they need a real database connection, tenant scoping, and the rest of the entity types (controls, treatments, assets), not a rewrite from zero.

### 3.5 Asset ingestion (highest-priority functional gap)
Two-phase, matching the existing six-month roadmap rather than front-loading the hard part:
- **Now (precedes Month 3 on the roadmap, should happen before any pilot)**: Replace the fake `setTimeout` handler with real parsing. `exceljs` is already an installed dependency and is currently unused for this purpose — wire it to actually read uploaded XLSX/CSV rows into real `Asset` records, with an honest result message (`"42 rows parsed, 39 assets created, 3 rows need review"`), not a fabricated one. This requires no AI and closes the credibility gap for free.
- **Month 5 (per existing roadmap)**: Layer SLM/Claude API ingestion on top of the now-real parsing pipeline for unstructured documents. This is additive to the fix above, not a replacement for it — real structured-file parsing should exist regardless of AI ingestion timing, since spreadsheets are likely the dominant input format for GRC asset registers regardless of how sophisticated the AI layer eventually gets.

### 3.6 Data hygiene
- Delete `src/pages/Reports.tsx` (dead code) after porting its 15 named report types into the reporting requirements list (§5).
- Delete `src/types/grc.ts`, `src/api/client.ts`, and the six System A pages, per §0. Do not leave them in the tree "in case" — an unused, schema-incompatible second `Risk` type sitting in the repo is exactly the kind of thing an agent or future engineer picks up by accident.
- Replace the tabletop-exercise mock seed data in `DataContext.tsx` with clearly synthetic, generically-named risk and asset entries before any external-facing use of the repo.

---

## 4. RBAC Matrix (Target State)

| Role | Risk Register | Asset Register | Control Library | Treatment Plans | Reports | Admin |
|---|---|---|---|---|---|---|
| Administrator | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full | Full |
| CRO / Executive | Read all, comment | Read | Read | Read, approve | Full | — |
| Risk Owner | CRUD own/assigned | CRUD own/assigned | Read, propose | CRUD own | Own scope | — |
| Compliance Officer | Read all | Read | Full CRUD | Read | Full | — |
| Internal Auditor | Read-only, all | Read-only | Read-only | Read-only | Full | — |
| Read-Only / Board Viewer | Read summary only | — | — | — | Summary only | — |

This is six roles, matching the existing implementation spec. It does not exist anywhere in the current code (§1.4) and is the target for §3.3's migration, not a description of present state.

---

## 5. Reporting Requirements (carried forward from the orphaned `Reports.tsx`)

The dead `Reports.tsx` file, despite being unrouted and non-functional, contains the most specific reporting requirements found anywhere in the repository. These should be treated as real requirements input, not discarded with the file:

All Risks · Key Risk Report · Appetite Breached · Risk Control Matrix (RCM) · Control Register · Comprehensive Risk Report · Enterprise Risk Summary · Departmental Risk Summary (selectable by department) · Division Risk Summary (selectable by division) · Quarterly Report · Root Cause Report · Risk Consequences Report · KRI Breached Report · Departmental Risk Detail · Division Risk Detail.

`ReportsView.tsx` (the live, routed 508-line file) should be audited against this list separately to determine actual coverage before Month 3/6 report-generation work begins — out of scope for this document, flagged as a follow-up.

---

## 6. Sequencing Against the Existing Six-Month Roadmap

This document does not replace the phased roadmap already on record. It changes what Month 1–2 actually require, because the starting point is different from "frontend prototype, no backend" — it's "two frontend prototypes sharing a shell, one real auth flow, one disconnected real API, one fake core feature."

- **Month 1 (Backend, zero UI)**: Unchanged in spirit, revised in detail — extend `server.ts`'s existing risk routes rather than greenfield; implement RLS against a schema that has never had a tenant column, not one that's migrating off a weak `projectId` filter; build the six-role matrix correctly once rather than reconciling three existing wrong ones.
- **Month 2 (Frontend, risk register, heatmap, treatment workflow)**: Add "delete System A" and "fix the asset register's fake parser" as explicit, named tasks in this month — both are small relative to the rest of the roadmap and both remove active liabilities (a confusing dead parallel system, a feature that lies about its own success) rather than adding net-new scope.
- **Months 3–6**: Unchanged, with §3.5's two-phase ingestion split now made explicit rather than implied.

---

## 7. What This Document Deliberately Does Not Cover

Per the original implementation spec already on file: detailed page-by-page UI instructions, full database DDL, and the AWS SIEM/security architecture. Those documents remain valid and are not superseded — this document supersedes only the two architectural specs that turned out to be describing two different systems, and adds the ground-truth findings from the actual repo that neither of those documents could have had, since neither was written by reading the code.
