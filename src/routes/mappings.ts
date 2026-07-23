import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";
import { createAuditEntry } from "../lib/audit";

const router = express.Router();

router.get("/", authenticateToken, requirePermission("risk:read", "control:read"), async (req: any, res: any) => {
  const riskControlMappings = await prisma.riskControlMapping.findMany();
  res.json({ riskControlMappings });
});

router.post("/", authenticateToken, requirePermission("risk:update"), async (req: any, res: any) => {
  const { riskId, controlId, weight } = req.body;
  
  const existing = await prisma.riskControlMapping.findUnique({
    where: { riskId_controlId: { riskId, controlId } }
  });
  
  const mapping = await prisma.riskControlMapping.upsert({
    where: { riskId_controlId: { riskId, controlId } },
    update: { weight },
    create: { riskId, controlId, weight }
  });

  await createAuditEntry("mapping", `${riskId}-${controlId}`, undefined, existing ? "update" : "create", req.user, existing, mapping, req);
  res.json(mapping);
});

router.delete("/", authenticateToken, requirePermission("risk:update"), async (req: any, res: any) => {
  const { riskId, controlId } = req.body;
  
  const existing = await prisma.riskControlMapping.findUnique({
    where: { riskId_controlId: { riskId, controlId } }
  });
  
  if (existing) {
    await prisma.riskControlMapping.delete({
      where: { riskId_controlId: { riskId, controlId } }
    });
    await createAuditEntry("mapping", `${riskId}-${controlId}`, undefined, "delete", req.user, existing, null, req);
  }
  
  res.status(204).send();
});

export default router;
