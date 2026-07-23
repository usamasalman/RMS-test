# GRC Wisdom — Reporting Requirements

Carried forward from the retired `src/pages/Reports.tsx` (System A).  
The live reports UI is `src/pages/ReportsView.tsx` — audit coverage against this list in Phase 10.

## Required report types

| # | Report | Description | Scope selector |
|---|---|---|---|
| 1 | All Risks | All risks in the organization with filters for multiple parameters | — |
| 2 | Key Risk | Risks marked as Key Risks | — |
| 3 | Appetite Breached | Risks whose appetite against each category has been breached | — |
| 4 | Risk Control Matrix (RCM) | Matrix linking risks to controls, objectives, testing procedures, and evidence | — |
| 5 | Control Register | All controls in the organization | — |
| 6 | Comprehensive Risk Report | Comprehensive risk report on a single click | — |
| 7 | Enterprise Risk Summary Report | Enterprise-level risk summary on a single click | — |
| 8 | Departmental Risk Summary Report | Departmental level risk summary on a single click | Department |
| 9 | Division Risk Summary Report | Division level risk summary on a single click | Division |
| 10 | Quarterly Report | All risks with filters for multiple parameters | — |
| 11 | Root Cause Report | All root causes in the organization | — |
| 12 | Risk Consequences Report | All risk consequences in the organization | — |
| 13 | KRI Breached Report | KRIs that have breached threshold limits | — |
| 14 | Departmental Risk Detail Report | Department risk detail on a single click | Department |
| 15 | Division Risk Detail Report | Division risk detail on a single click | Division |

## Current coverage (ReportsView.tsx — post Phase 0)

Partial overlap only; full implementation is Phase 10:

- Risk Register snapshot (partial → All Risks / Comprehensive)
- Asset Register snapshot
- Control Register snapshot
- Full Platform Report (combines the above)

Not yet implemented: Key Risk, Appetite Breached, RCM, Enterprise/Departmental/Division summaries, Quarterly, Root Cause, Consequences, KRI Breached, detail reports.
