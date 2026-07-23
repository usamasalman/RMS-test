import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";
import { createAuditEntry } from "../lib/audit";

const router = express.Router();

router.get("/", authenticateToken, requirePermission("control:read"), async (req: any, res: any) => {
  const controls = await prisma.control.findMany({
    include: { owner: { select: { id: true, name: true, role: true } } }
  });
  res.json({ controls });
});

router.post("/", authenticateToken, requirePermission("control:create"), async (req: any, res: any) => {
  const { id, riskMappings, treatments, owner, createdAt, updatedAt, ...dataToCreate } = req.body;
  const newControl = await prisma.control.create({ data: dataToCreate });
  await createAuditEntry("control", newControl.id, newControl.code, "create", req.user, null, newControl, req);
  res.json(newControl);
});

router.put("/:id", authenticateToken, requirePermission("control:update"), async (req: any, res: any) => {
  const oldControl = await prisma.control.findUnique({ where: { id: req.params.id } });
  if (!oldControl) return res.status(404).json({ error: "Not found" });
  
  const { id, riskMappings, treatments, owner, createdAt, updatedAt, ...dataToUpdate } = req.body;
  const newControl = await prisma.control.update({
    where: { id: req.params.id },
    data: dataToUpdate
  });
  
  await createAuditEntry("control", oldControl.id, oldControl.code, "update", req.user, oldControl, newControl, req);
  res.json(newControl);
});

router.delete("/:id", authenticateToken, requirePermission("control:delete"), async (req: any, res: any) => {
  const oldControl = await prisma.control.findUnique({ where: { id: req.params.id } });
  if (!oldControl) return res.status(404).json({ error: "Not found" });
  
  await prisma.control.delete({ where: { id: req.params.id } });
  await createAuditEntry("control", oldControl.id, oldControl.code, "delete", req.user, oldControl, null, req);
  res.status(204).send();
});

export default router;
