import { prisma } from "./prisma";

export const generateId = () => String(Date.now()) + Math.random().toString(16).slice(2);

export const computeFieldDiff = (oldRecord: any, newRecord: any) => {
  if (!oldRecord && !newRecord) return [];
  if (!oldRecord) {
    return Object.keys(newRecord).map(field => ({ field, oldValue: null, newValue: newRecord[field] }));
  }
  if (!newRecord) {
    return Object.keys(oldRecord).map(field => ({ field, oldValue: oldRecord[field], newValue: null }));
  }
  
  const fields = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
  const diff: { field: string, oldValue: any, newValue: any }[] = [];
  
  for (const field of fields) {
    if (['updated_at', 'updatedAt', 'createdAt'].includes(field)) continue;
    
    const oldVal = oldRecord[field];
    const newVal = newRecord[field];
    
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff.push({ field, oldValue: oldVal, newValue: newVal });
    }
  }
  return diff;
};

export const getNextVersion = async (entityType: string, entityId: string) => {
  const count = await prisma.snapshot.count({
    where: { entityType, entityId }
  });
  return count + 1;
};

export const createSnapshot = async (entityType: string, entityId: string, version: number, data: any, userId: string, trigger: string) => {
  const snapshot = await prisma.snapshot.create({
    data: {
      entityType,
      entityId,
      version,
      data: JSON.parse(JSON.stringify(data)),
      createdBy: userId,
    }
  });
  return snapshot.id;
};

export async function createAuditEntry(
  entityType: string, entityId: string, entityCode: string | undefined | null,
  action: string, user: { id: string; name: string; role: string },
  oldRecord: any | null, newRecord: any | null,
  req: any, note?: string
) {
  const fieldChanges = computeFieldDiff(oldRecord, newRecord);
  
  let snapshotId: string | undefined = undefined;
  if (newRecord) {
    const version = await getNextVersion(entityType, entityId);
    snapshotId = await createSnapshot(entityType, entityId, version, newRecord, user.id, action);
  }
  
  const entry = await prisma.auditLog.create({
    data: {
      entityType, 
      entityId, 
      entityCode, 
      action,
      userId: user.id, 
      userName: user.name, 
      userRole: user.role,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      note,
      fieldChanges: fieldChanges as any,
      snapshotId,
    }
  });
  
  return entry;
}
