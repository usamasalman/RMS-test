const fs = require('fs');

const newServerCode = `
import express from "express";
import net from "net";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

import authRoutes from "./src/routes/auth";
import risksRoutes from "./src/routes/risks";
import controlsRoutes from "./src/routes/controls";
import treatmentsRoutes from "./src/routes/treatments";
import assetsRoutes from "./src/routes/assets";
import mappingsRoutes from "./src/routes/mappings";
import auditRoutes from "./src/routes/audit";
import reportsRoutes from "./src/routes/reports";

import { authenticateToken, requirePermission } from "./src/middleware/auth";
import { prisma } from "./src/lib/prisma";

async function findAvailablePort(startPort: number) {
  let port = startPort;
  while (port < startPort + 100) {
    const isAvailable = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on("error", () => resolve(false));
      server.listen(port, "0.0.0.0", () => {
        server.close(() => resolve(true));
      });
    });
    if (isAvailable) return port;
    port += 1;
  }
  throw new Error(\`No free port found starting from \${startPort}\`);
}

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT ?? 3001);
  const PORT = await findAvailablePort(preferredPort);
  const preferredHmrPort = Number(process.env.VITE_HMR_PORT ?? PORT + 1);
  const HMR_PORT = await findAvailablePort(preferredHmrPort);

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

  if (process.env.NODE_ENV === "production") {
    // Serve static files from the React app build directory
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  } else {
    // Vite integration for development
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: HMR_PORT } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
    if (process.env.NODE_ENV !== "production") {
      console.log(\`Vite HMR running on port \${HMR_PORT}\`);
    }
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
`;

fs.writeFileSync('server.ts', newServerCode, 'utf8');
console.log('Successfully replaced server.ts');
