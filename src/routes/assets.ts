import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";
import { createAuditEntry } from "../lib/audit";

const router = express.Router();

router.get("/", authenticateToken, requirePermission("asset:read"), async (req: any, res: any) => {
  const assets = await prisma.asset.findMany({
    include: { owner: { select: { id: true, name: true, role: true } } }
  });
  res.json({ assets });
});

router.post("/", authenticateToken, requirePermission("asset:create"), async (req: any, res: any) => {
  const { id, owner, risks, createdAt, updatedAt, ...dataToCreate } = req.body;
  const newAsset = await prisma.asset.create({ data: dataToCreate });
  await createAuditEntry("asset", newAsset.id, newAsset.code, "create", req.user, null, newAsset, req);
  res.json(newAsset);
});

router.put("/:id", authenticateToken, requirePermission("asset:update"), async (req: any, res: any) => {
  const oldAsset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!oldAsset) return res.status(404).json({ error: "Not found" });
  
  const { id, owner, risks, createdAt, updatedAt, ...dataToUpdate } = req.body;
  const newAsset = await prisma.asset.update({
    where: { id: req.params.id },
    data: dataToUpdate
  });
  
  await createAuditEntry("asset", oldAsset.id, oldAsset.code, "update", req.user, oldAsset, newAsset, req);
  res.json(newAsset);
});

router.delete("/:id", authenticateToken, requirePermission("asset:delete"), async (req: any, res: any) => {
  const oldAsset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!oldAsset) return res.status(404).json({ error: "Not found" });
  
  await prisma.asset.delete({ where: { id: req.params.id } });
  await createAuditEntry("asset", oldAsset.id, oldAsset.code, "delete", req.user, oldAsset, null, req);
  res.status(204).send();
});

export default router;
