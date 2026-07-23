import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";
import { createAuditEntry } from "../lib/audit";

const router = express.Router();

router.get("/", authenticateToken, requirePermission("risk:read"), async (req: any, res: any) => {
  const risks = await prisma.risk.findMany({
    include: {
      controlMappings: { include: { control: true } },
      treatmentPlans: true,
      owner: { select: { id: true, name: true, role: true } }
    }
  });
  res.json({ risks });
});

router.get("/:id", authenticateToken, requirePermission("risk:read"), async (req: any, res: any) => {
  const risk = await prisma.risk.findUnique({
    where: { id: req.params.id },
    include: {
      controlMappings: { include: { control: true } },
      treatmentPlans: { include: { owner: true } },
      owner: { select: { id: true, name: true, role: true } }
    }
  });
  if (!risk) return res.status(404).json({ error: "Risk not found" });
  res.json({ risk });
});

router.post("/", authenticateToken, requirePermission("risk:create"), async (req: any, res: any) => {
  const { id, controlMappings, treatmentPlans, owner, kris, createdAt, updatedAt, rootCauseId, ...dataToCreate } = req.body;
  const newRisk = await prisma.risk.create({ data: dataToCreate });
  await createAuditEntry("risk", newRisk.id, newRisk.code, "create", req.user, null, newRisk, req);
  await updateRiskScores(newRisk.id);
  res.json(newRisk);
});

router.put("/:id", authenticateToken, requirePermission("risk:update"), async (req: any, res: any) => {
  const oldRisk = await prisma.risk.findUnique({ where: { id: req.params.id } });
  if (!oldRisk) return res.status(404).json({ error: "Not found" });
  
  const { id, controlMappings, treatmentPlans, owner, kris, createdAt, updatedAt, rootCauseId, ...dataToUpdate } = req.body;
  const newRisk = await prisma.risk.update({
    where: { id: req.params.id },
    data: dataToUpdate
  });
  
  await createAuditEntry("risk", oldRisk.id, oldRisk.code, "update", req.user, oldRisk, newRisk, req);
  await updateRiskScores(newRisk.id);
  res.json(newRisk);
});

router.delete("/:id", authenticateToken, requirePermission("risk:delete"), async (req: any, res: any) => {
  const oldRisk = await prisma.risk.findUnique({ where: { id: req.params.id } });
  if (!oldRisk) return res.status(404).json({ error: "Not found" });
  
  await prisma.risk.delete({ where: { id: req.params.id } });
  await createAuditEntry("risk", oldRisk.id, oldRisk.code, "delete", req.user, oldRisk, null, req);
  res.status(204).send();
});

// We need a helper to compute and update risk scores using the existing logic in risk-utils.ts
// but it needs to query prisma. 
async function updateRiskScores(riskId: string) {
  const risk = await prisma.risk.findUnique({
    where: { id: riskId },
    include: { controlMappings: { include: { control: true } }, treatmentPlans: true }
  });
  if (!risk) return;

  const { computeInherentRiskScore, computeResidualRiskScore, computePostTreatmentRRS, getRiskLevel } = await import("../lib/risk-utils");
  
  const inherentScore = computeInherentRiskScore(
    risk.likelihood,
    risk.impact,
    risk.cia_c || 3,
    risk.cia_i || 3,
    risk.cia_a || 3,
  );

  const controls = risk.controlMappings.map(m => m.control);
  const residualScore = computeResidualRiskScore(inherentScore, controls as any);
  
  const treatmentProgress = risk.treatmentPlans.reduce((acc, plan) => acc + plan.progress, 0) / (risk.treatmentPlans.length || 1);
  const postTreatmentScore = computePostTreatmentRRS(residualScore, treatmentProgress);
  const riskLevel = getRiskLevel(postTreatmentScore);

  await prisma.risk.update({
    where: { id: riskId },
    data: { inherentScore, residualScore, postTreatmentScore, riskLevel }
  });
}

export default router;
