import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";
import { createAuditEntry } from "../lib/audit";

const router = express.Router();

router.get("/", authenticateToken, requirePermission("treatment:read"), async (req: any, res: any) => {
  const treatmentPlans = await prisma.treatmentPlan.findMany({
    include: { owner: { select: { id: true, name: true, role: true } } }
  });
  res.json({ treatmentPlans });
});

router.post("/", authenticateToken, requirePermission("treatment:create"), async (req: any, res: any) => {
  // Map fields from API request to Prisma schema
  const { title, description, riskId, strategy, ownerId, progress, deadline, mappedControlId } = req.body;
  
  const newPlan = await prisma.treatmentPlan.create({ 
    data: {
      title, description, riskId, strategy, ownerId, progress, mappedControlId,
      deadline: new Date(deadline),
    } 
  });
  await createAuditEntry("treatment", newPlan.id, undefined, "create", req.user, null, newPlan, req);
  res.json(newPlan);
});

router.put("/:id", authenticateToken, requirePermission("treatment:update"), async (req: any, res: any) => {
  const oldPlan = await prisma.treatmentPlan.findUnique({ where: { id: req.params.id } });
  if (!oldPlan) return res.status(404).json({ error: "Not found" });
  
  const { deadline, ...rest } = req.body;
  const newPlan = await prisma.treatmentPlan.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(deadline && { deadline: new Date(deadline) })
    }
  });
  
  await createAuditEntry("treatment", oldPlan.id, undefined, "update", req.user, oldPlan, newPlan, req);
  res.json(newPlan);
});

router.delete("/:id", authenticateToken, requirePermission("treatment:delete"), async (req: any, res: any) => {
  const oldPlan = await prisma.treatmentPlan.findUnique({ where: { id: req.params.id } });
  if (!oldPlan) return res.status(404).json({ error: "Not found" });
  
  await prisma.treatmentPlan.delete({ where: { id: req.params.id } });
  await createAuditEntry("treatment", oldPlan.id, undefined, "delete", req.user, oldPlan, null, req);
  res.status(204).send();
});

export default router;
