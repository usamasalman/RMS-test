import express from "express";
import cors from "cors";

import authRoutes from "../src/routes/auth";
import risksRoutes from "../src/routes/risks";
import controlsRoutes from "../src/routes/controls";
import treatmentsRoutes from "../src/routes/treatments";
import assetsRoutes from "../src/routes/assets";
import mappingsRoutes from "../src/routes/mappings";
import auditRoutes from "../src/routes/audit";
import reportsRoutes from "../src/routes/reports";

import { authenticateToken, requirePermission } from "../src/middleware/auth";
import { prisma } from "../src/lib/prisma";

const app = express();

app.use(cors());
app.use(express.json());

// Mount API Routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/risks", risksRoutes);
app.use("/api/v1/controls", controlsRoutes);
app.use("/api/v1/treatments", treatmentsRoutes);
app.use("/api/v1/assets", assetsRoutes);
app.use("/api/v1/risk-control-mappings", mappingsRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1", auditRoutes);

// Admin users endpoint
app.get("/api/v1/admin/users", authenticateToken, requirePermission("user:read"), async (req: any, res: any) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  res.json({ users });
});

export default app;
