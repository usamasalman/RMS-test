export type Role =
  | "Administrator"
  | "CRO / Executive"
  | "Risk Owner"
  | "Compliance Officer"
  | "Internal Auditor"
  | "Read-Only / Board Viewer";

export const ALL_ROLES: Role[] = [
  "Administrator",
  "CRO / Executive",
  "Risk Owner",
  "Compliance Officer",
  "Internal Auditor",
  "Read-Only / Board Viewer",
];

// Role hierarchy levels (higher = more permissions)
export const ROLE_LEVELS: Record<Role, number> = {
  "Administrator": 6,
  "CRO / Executive": 5,
  "Compliance Officer": 4,
  "Risk Owner": 3,
  "Internal Auditor": 2,
  "Read-Only / Board Viewer": 1,
};

// Actions the system recognizes
export type Permission =
  | 'risk:create' | 'risk:read' | 'risk:update' | 'risk:delete'
  | 'risk:approve_critical' | 'risk:approve_high' | 'risk:approve_moderate'
  | 'risk:submit' | 'risk:import'
  | 'control:create' | 'control:read' | 'control:update' | 'control:delete'
  | 'treatment:create' | 'treatment:read' | 'treatment:update' | 'treatment:delete'
  | 'asset:create' | 'asset:read' | 'asset:update' | 'asset:delete'
  | 'evidence:upload' | 'evidence:read' | 'evidence:delete'
  | 'audit:read' | 'audit:export'
  | 'report:generate' | 'report:export' | 'report:schedule'
  | 'user:manage' | 'user:read';

// Permission matrix
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "Administrator": [
    'risk:create', 'risk:read', 'risk:update', 'risk:delete',
    'risk:approve_critical', 'risk:approve_high', 'risk:approve_moderate',
    'risk:submit', 'risk:import',
    'control:create', 'control:read', 'control:update', 'control:delete',
    'treatment:create', 'treatment:read', 'treatment:update', 'treatment:delete',
    'asset:create', 'asset:read', 'asset:update', 'asset:delete',
    'evidence:upload', 'evidence:read', 'evidence:delete',
    'audit:read', 'audit:export',
    'report:generate', 'report:export', 'report:schedule',
    'user:manage', 'user:read'
  ],
  "CRO / Executive": [
    'risk:create', 'risk:read', 'risk:update', 'risk:submit',
    'risk:approve_critical', 'risk:approve_high', 'risk:approve_moderate',
    'risk:import',
    'control:create', 'control:read', 'control:update',
    'treatment:create', 'treatment:read', 'treatment:update',
    'asset:create', 'asset:read', 'asset:update',
    'evidence:upload', 'evidence:read',
    'audit:read',
    'report:generate', 'report:export', 'report:schedule',
    'user:read'
  ],
  "Compliance Officer": [
    'risk:create', 'risk:read', 'risk:update', 'risk:submit',
    'risk:approve_high', 'risk:approve_moderate',
    'control:create', 'control:read', 'control:update',
    'treatment:create', 'treatment:read', 'treatment:update',
    'asset:create', 'asset:read', 'asset:update',
    'evidence:upload', 'evidence:read',
    'audit:read',
    'report:generate', 'report:export',
    'user:read'
  ],
  "Risk Owner": [
    'risk:create', 'risk:read', 'risk:update', 'risk:submit',
    'risk:approve_moderate',
    'control:create', 'control:read', 'control:update',
    'treatment:create', 'treatment:read', 'treatment:update',
    'asset:read',
    'evidence:upload', 'evidence:read',
    'report:generate', 'report:export',
    'user:read'
  ],
  "Internal Auditor": [
    'risk:read', 'control:read', 'treatment:read', 'asset:read',
    'evidence:upload', 'evidence:read', 
    'audit:read', 'audit:export',
    'report:generate', 'report:export',
    'user:read'
  ],
  "Read-Only / Board Viewer": [
    'risk:read', 'control:read', 'treatment:read', 'asset:read',
    'evidence:read',
    'report:generate', 'report:export'
  ],
};
