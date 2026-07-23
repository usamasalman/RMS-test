import type { Role } from "./roles";

export type Likelihood = number;
export type Impact = number;

export interface OrgUnit {
  id: string;
  name: string;
  division: string;
  department: string;
  parentUnitId?: string;
}

export type { Role, Permission } from "./roles";

export interface User {
  id: string;
  name: string;
  role: Role;
  orgUnitId: string;
  avatarUrl?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'Hardware' | 'Software' | 'Data' | 'Facility' | 'People' | 'Vendor';
  criticality: 'High' | 'Medium' | 'Low';
  ownerId: string;
  status: 'Active' | 'Inactive' | 'Archived';
  createdAt: string;
}

export interface Risk {
  id: string;
  code: string;
  title: string;
  description: string;
  categoryId: string;
  rootCauseId?: string;
  rootCause?: string;
  processId?: string;
  ownerId: string;
  relatedAssetId?: string;
  likelihood: Likelihood;
  impact: Impact;
  cia_c?: number;
  cia_i?: number;
  cia_a?: number;
  status: 'Open' | 'In Progress' | 'Closed' | 'Under Review';
  serviceTower?: string;
  treatmentStrategy?: 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid';
  targetDate?: string;
  kpiLink?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  inherentScore?: number;
  residualScore?: number;
  postTreatmentScore?: number;
  riskLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface RiskAssessment {
  riskId: string;
  inherentLikelihood: Likelihood;
  inherentImpact: Impact;
}

export interface Control {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'Preventive' | 'Detective' | 'Corrective';
  nature: 'Manual' | 'Automated' | 'IT Dependent' | 'Hybrid';
  designEffectiveness: number; // 0 to 1
  operatingEffectiveness: number; // 0 to 1
  ownerId: string;
  objective?: string;
  testingProcedure?: string;
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  evidence?: string;
}

export interface RiskControlMapping {
  riskId: string;
  controlId: string;
  weight: number; // For weighting the control's importance to the specific risk
}

export interface TreatmentTask {
  id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  deadline: string;
  assigneeId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface TreatmentPlan {
  id: string;
  title?: string;
  description?: string;
  riskId: string;
  strategy: 'Avoid' | 'Mitigate' | 'Transfer' | 'Accept';
  ownerId: string;
  progress: number; // 0 - 100
  deadline: string;
  mappedControlId?: string;
}

export interface AuditEntry {
  id: string;
  entityType: 'risk' | 'control' | 'treatment' | 'asset' | 'kri' | 'document' | 'user' | 'mapping' | 'system';
  entityId: string;
  entityCode?: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'submit' | 'status_change' | 'import' | 'export' | 'login' | 'lock' | 'unlock' | 'access_denied';
  userId: string;
  userName: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  note?: string;
  fieldChanges: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  snapshotId?: string;
  timestamp: string;
}

export interface Snapshot {
  id: string;
  entityType: string;
  entityId: string;
  version: number;
  data: any;
  createdBy: string;
  createdAt: string;
  trigger: string;
}
