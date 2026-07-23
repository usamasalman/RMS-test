import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";

const router = express.Router();

router.get("/audit-log", authenticateToken, requirePermission("audit:read"), async (req: any, res: any) => {
  const { entityType, entityId, limit = "50" } = req.query;
  const parsedLimit = parseInt(limit, 10);
  
  const where: any = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const logs = await prisma.auditLog.findMany({
    where,
    take: isNaN(parsedLimit) ? 50 : parsedLimit,
    orderBy: { timestamp: 'desc' }
  });
  
  res.json({ auditLog: logs });
});

router.get("/snapshots/:id", authenticateToken, requirePermission("audit:read"), async (req: any, res: any) => {
  const snapshot = await prisma.snapshot.findUnique({
    where: { id: req.params.id }
  });
  if (!snapshot) {
    return res.status(404).json({ error: "Snapshot not found" });
  }
  res.json({ snapshot });
});

export default router;
