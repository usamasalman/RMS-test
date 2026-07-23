import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import {
  Risk,
  Control,
  TreatmentPlan,
  User,
  Role,
  RiskControlMapping,
  OrgUnit,
  Asset,
  AppNotification,
} from "../types";
import { Permission, ROLE_PERMISSIONS } from "../types/roles";
import { useAuth } from "./AuthContext";

type RiskApiRecord = {
  id: string;
  code: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  cia_c?: number;
  cia_i?: number;
  cia_a?: number;
  status: string;
  serviceTower?: string;
  treatmentStrategy?: Risk["treatmentStrategy"];
  targetDate?: string;
  kpiLink?: string;
  comments?: string;
  rootCause?: string;
  rootCauseId?: string;
  processId?: string;
  ownerId: string;
  relatedAssetId?: string;
  created_at: string;
  updated_at: string;
  inherentScore?: number;
  residualScore?: number;
  postTreatmentScore?: number;
  riskLevel?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function apiRiskToRisk(record: RiskApiRecord): Risk {
  return {
    id: record.id,
    code: record.code,
    title: record.title,
    description: record.description,
    categoryId: "c1",
    rootCauseId: record.rootCauseId,
    rootCause: record.rootCause,
    processId: record.processId,
    ownerId: record.ownerId,
    relatedAssetId: record.relatedAssetId,
    likelihood: record.likelihood,
    impact: record.impact,
    cia_c: record.cia_c,
    cia_i: record.cia_i,
    cia_a: record.cia_a,
    status: record.status as Risk["status"],
    serviceTower: record.serviceTower,
    treatmentStrategy: record.treatmentStrategy,
    targetDate: record.targetDate,
    kpiLink: record.kpiLink,
    comments: record.comments,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function riskToApiPayload(risk: Omit<Risk, "id" | "code" | "createdAt" | "updatedAt">) {
  return {
    ...risk,
    status: risk.status,
  };
}

interface DataContextType {
  risks: Risk[];
  controls: Control[];
  treatmentPlans: TreatmentPlan[];
  users: User[];
  orgUnits: OrgUnit[];
  assets: Asset[];
  riskControlMappings: RiskControlMapping[];
  currentRole: Role;
  notifications: AppNotification[];
  // Actions
  addRisk: (
    risk: Omit<Risk, "id" | "code" | "createdAt" | "updatedAt">,
  ) => void;
  updateRisk: (id: string, risk: Partial<Risk>) => void;
  deleteRisk: (id: string) => void;
  addAsset: (asset: Omit<Asset, "id" | "code" | "createdAt">) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  addControl: (control: Omit<Control, "id" | "code">) => void;
  updateControl: (id: string, control: Partial<Control>) => void;
  deleteControl: (id: string) => void;
  addTreatmentPlan: (plan: Omit<TreatmentPlan, "id">) => void;
  updateTreatmentPlan: (id: string, plan: Partial<TreatmentPlan>) => void;
  deleteTreatmentPlan: (id: string) => void;
  linkControlToRisk: (riskId: string, controlId: string, weight: number) => void;
  removeControlMapping: (riskId: string, controlId: string) => void;
  setCurrentRole: (role: Role) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const mockUsers: User[] = [
  { id: "u1", name: "Admin User", role: "Administrator", orgUnitId: "o1" },
  { id: "u2", name: "Risk Owner", role: "Risk Owner", orgUnitId: "o2" },
  { id: "u3", name: "Audit Reviewer", role: "Internal Auditor", orgUnitId: "o1" },
];

const mockOrgUnits: OrgUnit[] = [
  {
    id: "o1",
    name: "Executive",
    division: "Headquarters",
    department: "Management",
  },
  {
    id: "o2",
    name: "IT Infrastructure",
    division: "Technology",
    department: "IT",
  },
];

const mockRisksData = [
  {
    id: "r1",
    code: "RSK-001",
    title: "Customer Data Access Misconfiguration",
    description:
      "Inadequate access controls may expose customer data to unauthorized internal users.",
  },
  {
    id: "r2",
    code: "RSK-002",
    title: "Third-Party Service Outage",
    description:
      "Dependence on a single external SaaS provider can disrupt operations during outages.",
  },
  {
    id: "r3",
    code: "RSK-003",
    title: "Delayed Critical Patch Deployment",
    description:
      "Security patches for internet-facing systems may not be applied within policy timelines.",
  },
  {
    id: "r4",
    code: "RSK-004",
    title: "Weak Vendor Due Diligence",
    description:
      "Onboarding process may miss control assurance evidence for high-risk suppliers.",
  },
  {
    id: "r5",
    code: "RSK-005",
    title: "Ineffective Change Approval Workflow",
    description:
      "Production changes may proceed without required reviewer approval.",
  },
  {
    id: "r6",
    code: "RSK-006",
    title: "Data Retention Policy Non-Compliance",
    description:
      "Retention schedules may not be consistently enforced across business systems.",
  },
  {
    id: "r7",
    code: "RSK-007",
    title: "Manual Reconciliation Errors",
    description:
      "Spreadsheet-based financial reconciliations may introduce human error and delay reporting.",
  },
  {
    id: "r8",
    code: "RSK-008",
    title: "Insufficient Incident Response Testing",
    description:
      "Incident response playbooks may be outdated and not validated through periodic exercises.",
  },
];

const mockAssets: Asset[] = [
  {
    id: "a1",
    code: "AST-001",
    name: "Primary Database Server",
    description: "Main PostgreSQL database hosted on AWS RDS.",
    type: "Hardware",
    criticality: "High",
    ownerId: "u1",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "a2",
    code: "AST-002",
    name: "Customer Portal",
    description: "Public facing web application.",
    type: "Software",
    criticality: "High",
    ownerId: "u2",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

const mockRisks: Risk[] = mockRisksData.map((item, index) => ({
  ...item,
  categoryId: `c${(index % 4) + 1}`,
  rootCauseId: `rc${(index % 4) + 1}`,
  processId: `p${(index % 2) + 1}`,
  ownerId: index % 2 === 0 ? "u1" : "u2",
  likelihood: (index % 5) + 1,
  impact: (index % 4) + 2,
  cia_c: 3,
  cia_i: 3,
  cia_a: 3,
  status:
    index % 3 === 0 ? "Closed" : index % 2 === 0 ? "Under Review" : "Open",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const mockControls: Control[] = [
  {
    id: "c1",
    code: "CTRL-001",
    title: "Multi-Factor Authentication (MFA)",
    description: "Enforce MFA for all external access to cloud environments.",
    objective: "Ensure only authorized personnel can access sensitive systems remotely.",
    testingProcedure: "Review AWS IAM logs to confirm MFA is enforced on all active user accounts.",
    frequency: "Monthly",
    evidence: "IAM MFA configuration report",
    type: "Preventive",
    nature: "Automated",
    designEffectiveness: 0.9,
    operatingEffectiveness: 0.8,
    ownerId: "u2",
  },
  {
    id: "c2",
    code: "CTRL-002",
    title: "Vendor SLA Monitoring",
    description: "Daily monitoring of vendor uptime against SLAs.",
    objective: "Ensure third-party vendors meet operational requirements.",
    testingProcedure: "Compare vendor uptime reports against SLA thresholds.",
    frequency: "Daily",
    evidence: "Uptime monitoring dashboard screenshot",
    type: "Detective",
    nature: "Automated",
    designEffectiveness: 0.7,
    operatingEffectiveness: 0.6,
    ownerId: "u2",
  },
];

const mockRiskControlMappings: RiskControlMapping[] = [
  { riskId: "r1", controlId: "c1", weight: 1.0 },
  { riskId: "r2", controlId: "c2", weight: 0.8 },
];

const mockTreatmentPlans: TreatmentPlan[] = [
  {
    id: "t1",
    riskId: "r1",
    strategy: "Mitigate",
    ownerId: "u2",
    progress: 40,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t2",
    riskId: "r4",
    strategy: "Mitigate",
    ownerId: "u1",
    progress: 80,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t3",
    riskId: "r5",
    strategy: "Accept",
    ownerId: "u2",
    progress: 100,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "t4",
    title: "Implement automated data discovery",
    riskId: "r3",
    strategy: "Mitigate",
    ownerId: "u1",
    progress: 20,
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

type ControlApiRecord = Control;
type TreatmentApiRecord = TreatmentPlan;
type AssetApiRecord = Asset;

const apiHeaders = (token: string | null) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

function cloneControls(controls: Control[]): Control[] {
  return controls.map((control) => ({ ...control }));
}

function cloneTreatments(plans: TreatmentPlan[]): TreatmentPlan[] {
  return plans.map((plan) => ({ ...plan }));
}

function cloneAssets(records: Asset[]): Asset[] {
  return records.map((asset) => ({ ...asset }));
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, updateRoleSimulation } = useAuth();

  const [risks, setRisks] = useState<Risk[]>(mockRisks);
  const [controls, setControls] = useState<Control[]>(mockControls);
  const [treatmentPlans, setTreatmentPlans] =
    useState<TreatmentPlan[]>(mockTreatmentPlans);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [orgUnits] = useState<OrgUnit[]>(mockOrgUnits);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [riskControlMappings, setRiskControlMappings] = useState<RiskControlMapping[]>(
    mockRiskControlMappings,
  );

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        const [riskResponse, controlResponse, treatmentResponse, assetResponse, mappingResponse] = await Promise.all([
          fetch(`${API_BASE}/risks`, { headers: apiHeaders(token) }),
          fetch(`${API_BASE}/controls`, { headers: apiHeaders(token) }),
          fetch(`${API_BASE}/treatments`, { headers: apiHeaders(token) }),
          fetch(`${API_BASE}/assets`, { headers: apiHeaders(token) }),
          fetch(`${API_BASE}/risk-control-mappings`, { headers: apiHeaders(token) }),
        ]);

        if (riskResponse.ok) {
          const riskPayload = await riskResponse.json();
          if (Array.isArray(riskPayload.risks)) {
            setRisks(riskPayload.risks.map(apiRiskToRisk));
          }
        }

        if (controlResponse.ok) {
          const controlPayload = await controlResponse.json();
          if (Array.isArray(controlPayload.controls)) {
            setControls(cloneControls(controlPayload.controls));
          }
        }

        if (treatmentResponse.ok) {
          const treatmentPayload = await treatmentResponse.json();
          if (Array.isArray(treatmentPayload.treatmentPlans)) {
            setTreatmentPlans(cloneTreatments(treatmentPayload.treatmentPlans));
          }
        }

        if (assetResponse.ok) {
          const assetPayload = await assetResponse.json();
          if (Array.isArray(assetPayload.assets)) {
            setAssets(cloneAssets(assetPayload.assets));
          }
        }

        if (mappingResponse.ok) {
          const mappingPayload = await mappingResponse.json();
          if (Array.isArray(mappingPayload.riskControlMappings)) {
            setRiskControlMappings(mappingPayload.riskControlMappings);
          }
        }
      } catch {
        // Keep the current local dataset if the API is unavailable.
      }
    };

    loadData();
  }, [token]);

  useEffect(() => {
    if (user) {
      setUsers((prev) => {
        if (!prev.some((u) => u.id === user.id)) {
          return [...prev, user as unknown as User];
        }
        return prev.map((u) => (u.id === user.id ? { ...u, name: user.name, role: user.role } : u));
      });
    }
  }, [user]);

  // Use Auth context for true current role
  const currentRole: Role = user?.role || "Administrator";
  const setCurrentRole = updateRoleSimulation;
  const isReadOnlyRole = currentRole === "Internal Auditor";

  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  const generatedNotifications: AppNotification[] = useMemo(() => {
    const notifs: AppNotification[] = [];
    
    treatmentPlans.forEach(t => {
       if (t.progress < 100) {
         const deadlineDate = new Date(t.deadline);
         const now = new Date();
         const diff = deadlineDate.getTime() - now.getTime();
         const days = Math.ceil(diff / (1000 * 3600 * 24));
         if (days <= 7 && days >= 0) {
           notifs.push({
             id: `t-warn-${t.id}`,
             title: 'Approaching Deadline',
             message: `Treatment plan "${t.title || 'Untitled'}" is due in ${days} days.`,
             type: 'warning',
             read: readNotificationIds.has(`t-warn-${t.id}`),
             createdAt: new Date().toISOString(),
           });
         } else if (days < 0) {
           notifs.push({
             id: `t-over-${t.id}`,
             title: 'Overdue Treatment Plan',
             message: `Treatment plan "${t.title || 'Untitled'}" is overdue by ${Math.abs(days)} days.`,
             type: 'error',
             read: readNotificationIds.has(`t-over-${t.id}`),
             createdAt: new Date().toISOString(),
           });
         }
       }
    });

    controls.forEach(c => {
       if (c.operatingEffectiveness < 0.7) {
         notifs.push({
           id: `c-fail-${c.id}`,
           title: 'Control Test Failure',
           message: `Control "${c.title}" has an operating effectiveness of ${Math.round(c.operatingEffectiveness * 100)}%, which is below the acceptable threshold.`,
           type: 'error',
           read: readNotificationIds.has(`c-fail-${c.id}`),
           createdAt: new Date().toISOString(),
         });
       }
    });

    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [treatmentPlans, controls, readNotificationIds]);

  const markNotificationAsRead = (id: string) => {
     setReadNotificationIds(prev => {
       const next = new Set(prev);
       next.add(id);
       return next;
     });
  };

  const markAllNotificationsAsRead = () => {
     setReadNotificationIds(new Set(generatedNotifications.map(n => n.id)));
  };

  const addRisk = (
    riskData: Omit<Risk, "id" | "code" | "createdAt" | "updatedAt">,
  ) => {
    if (isReadOnlyRole) return;
    const createRisk = async () => {
      try {
        const response = await fetch(`${API_BASE}/risks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(riskToApiPayload(riskData)),
        });

        if (!response.ok) {
          throw new Error("Failed to create risk");
        }

        const createdRisk = apiRiskToRisk(await response.json());
        setRisks((currentRisks) => [...currentRisks, createdRisk]);
      } catch {
        const newRisk: Risk = {
          ...riskData,
          id: `r${risks.length + 1}`,
          code: `RSK-00${risks.length + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setRisks([...risks, newRisk]);
      }
    };

    void createRisk();
  };

  const updateRisk = (id: string, riskData: Partial<Risk>) => {
    if (isReadOnlyRole) return;
    const patchRisk = async () => {
      try {
        const response = await fetch(`${API_BASE}/risks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(riskData),
        });

        if (!response.ok) {
          throw new Error("Failed to update risk");
        }

        const updatedRisk = apiRiskToRisk(await response.json());
        setRisks((currentRisks) =>
          currentRisks.map((risk) => (risk.id === id ? updatedRisk : risk)),
        );
      } catch {
        setRisks(
          risks.map((r) =>
            r.id === id
              ? { ...r, ...riskData, updatedAt: new Date().toISOString() }
              : r,
          ),
        );
      }
    };

    void patchRisk();
  };

  const deleteRisk = (id: string) => {
    if (isReadOnlyRole) return;
    const removeRisk = async () => {
      try {
        const response = await fetch(`${API_BASE}/risks/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok && response.status !== 204) {
          throw new Error("Failed to delete risk");
        }
      } finally {
        setRisks((currentRisks) => currentRisks.filter((risk) => risk.id !== id));
        setRiskControlMappings((mappings) => mappings.filter((mapping) => mapping.riskId !== id));
        setTreatmentPlans((plans) => plans.filter((plan) => plan.riskId !== id));
      }
    };

    void removeRisk();
  };

  const addAsset = (assetData: Omit<Asset, "id" | "code" | "createdAt">) => {
    if (isReadOnlyRole) return;
    const createAsset = async () => {
      try {
        const response = await fetch(`${API_BASE}/assets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify(assetData),
        });

        if (!response.ok) {
          throw new Error("Failed to create asset");
        }

        const createdAsset = (await response.json()) as Asset;
        setAssets((currentAssets) => [...currentAssets, createdAsset]);
      } catch {
        const newAsset: Asset = {
          ...assetData,
          id: `a${assets.length + 1}`,
          code: `AST-00${assets.length + 1}`,
          createdAt: new Date().toISOString(),
        };
        setAssets([...assets, newAsset]);
      }
    };

    void createAsset();
  };

  const updateAsset = (id: string, assetData: Partial<Asset>) => {
    if (isReadOnlyRole) return;
    const patchAsset = async () => {
      try {
        const response = await fetch(`${API_BASE}/assets/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify(assetData),
        });

        if (!response.ok) {
          throw new Error("Failed to update asset");
        }

        const updatedAsset = (await response.json()) as Asset;
        setAssets((currentAssets) =>
          currentAssets.map((asset) => (asset.id === id ? updatedAsset : asset)),
        );
      } catch {
        setAssets(
          assets.map(a => a.id === id ? { ...a, ...assetData } : a)
        );
      }
    };

    void patchAsset();
  };

  const deleteAsset = (id: string) => {
    if (isReadOnlyRole) return;
    const removeAsset = async () => {
      try {
        await fetch(`${API_BASE}/assets/${id}`, {
          method: "DELETE",
          headers: apiHeaders(token),
        });
      } finally {
        setAssets((currentAssets) => currentAssets.filter((asset) => asset.id !== id));
      }
    };

    void removeAsset();
  };

  const addControl = (controlData: Omit<Control, "id" | "code">) => {
    if (isReadOnlyRole) return;
    const createControl = async () => {
      try {
        const response = await fetch(`${API_BASE}/controls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify(controlData),
        });

        if (!response.ok) {
          throw new Error("Failed to create control");
        }

        const createdControl = (await response.json()) as Control;
        setControls((currentControls) => [...currentControls, createdControl]);
      } catch {
        const newControl: Control = {
          ...controlData,
          id: `c${controls.length + 1}`,
          code: `CTRL-${String(controls.length + 1).padStart(3, '0')}`,
        };
        setControls([...controls, newControl]);
      }
    };

    void createControl();
  };

  const updateControl = (id: string, controlData: Partial<Control>) => {
    if (isReadOnlyRole) return;
    const patchControl = async () => {
      try {
        const response = await fetch(`${API_BASE}/controls/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify(controlData),
        });

        if (!response.ok) {
          throw new Error("Failed to update control");
        }

        const updatedControl = (await response.json()) as Control;
        setControls((currentControls) =>
          currentControls.map((control) => (control.id === id ? updatedControl : control)),
        );
      } catch {
        setControls(
          controls.map(c => c.id === id ? { ...c, ...controlData } : c)
        );
      }
    };

    void patchControl();
  };

  const deleteControl = (id: string) => {
    if (isReadOnlyRole) return;
    const removeControl = async () => {
      try {
        await fetch(`${API_BASE}/controls/${id}`, {
          method: "DELETE",
          headers: apiHeaders(token),
        });
      } finally {
        setControls((currentControls) => currentControls.filter((control) => control.id !== id));
        setRiskControlMappings(mappings => mappings.filter(m => m.controlId !== id));
      }
    };

    void removeControl();
  };

  const addTreatmentPlan = (plan: Omit<TreatmentPlan, "id">) => {
    if (isReadOnlyRole) return;
    const createPlan = async () => {
      try {
        const response = await fetch(`${API_BASE}/treatments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify(plan),
        });

        if (!response.ok) {
          throw new Error("Failed to create treatment plan");
        }

        const createdPlan = (await response.json()) as TreatmentPlan;
        setTreatmentPlans((currentPlans) => [...currentPlans, createdPlan]);
      } catch {
        const newPlan: TreatmentPlan = {
          ...plan,
          id: `t${treatmentPlans.length + 1}`,
        };
        setTreatmentPlans([...treatmentPlans, newPlan]);
      }
    };

    void createPlan();
  };

  const updateTreatmentPlan = (id: string, plan: Partial<TreatmentPlan>) => {
    if (isReadOnlyRole) return;
    const patchPlan = async () => {
      try {
        const response = await fetch(`${API_BASE}/treatments/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify(plan),
        });

        if (!response.ok) {
          throw new Error("Failed to update treatment plan");
        }

        const updatedPlan = (await response.json()) as TreatmentPlan;
        setTreatmentPlans((currentPlans) =>
          currentPlans.map((treatmentPlan) => (treatmentPlan.id === id ? updatedPlan : treatmentPlan)),
        );
      } catch {
        setTreatmentPlans(treatmentPlans.map(t => t.id === id ? { ...t, ...plan } : t));
      }
    };

    void patchPlan();
  };

  const deleteTreatmentPlan = (id: string) => {
    if (isReadOnlyRole) return;
    const removePlan = async () => {
      try {
        await fetch(`${API_BASE}/treatments/${id}`, {
          method: "DELETE",
          headers: apiHeaders(token),
        });
      } finally {
        setTreatmentPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== id));
      }
    };

    void removePlan();
  };

  const linkControlToRisk = (riskId: string, controlId: string, weight: number) => {
    if (isReadOnlyRole) return;
    const linkMapping = async () => {
      try {
        const response = await fetch(`${API_BASE}/risk-control-mappings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify({ riskId, controlId, weight }),
        });

        if (!response.ok) {
          throw new Error("Failed to link control to risk");
        }

        const mapping = (await response.json()) as RiskControlMapping;
        setRiskControlMappings((currentMappings) => {
          const remaining = currentMappings.filter(
            (item) => !(item.riskId === riskId && item.controlId === controlId),
          );
          return [...remaining, mapping];
        });
      } catch {
        setRiskControlMappings([...riskControlMappings, { riskId, controlId, weight }]);
      }
    };

    void linkMapping();
  };

  const removeControlMapping = (riskId: string, controlId: string) => {
    if (isReadOnlyRole) return;
    const unlinkMapping = async () => {
      try {
        const response = await fetch(`${API_BASE}/risk-control-mappings`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...apiHeaders(token),
          },
          body: JSON.stringify({ riskId, controlId }),
        });

        if (!response.ok && response.status !== 204) {
          throw new Error("Failed to unlink control from risk");
        }
      } finally {
        setRiskControlMappings(riskControlMappings.filter(m => !(m.riskId === riskId && m.controlId === controlId)));
      }
    };

    void unlinkMapping();
  };

  return (
    <DataContext.Provider
      value={{
        risks,
        controls,
        treatmentPlans,
        users,
        orgUnits,
        assets,
        riskControlMappings,
        currentRole,
        addRisk,
        updateRisk,
        deleteRisk,
        addAsset,
        updateAsset,
        deleteAsset,
        addControl,
        updateControl,
        deleteControl,
        addTreatmentPlan,
        updateTreatmentPlan,
        deleteTreatmentPlan,
        linkControlToRisk,
        removeControlMapping,
        setCurrentRole,
        notifications: generatedNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export function usePermissions() {
  const { currentRole } = useData();
  const can = (permission: Permission) => ROLE_PERMISSIONS[currentRole]?.includes(permission) ?? false;
  return { can, currentRole };
}

