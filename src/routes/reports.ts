import express from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

const reportDefinitions = [
  { id: "all-risks", name: "All Risks", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "key-risk-report", name: "Key Risk Report", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "appetite-breached", name: "Appetite Breached", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "risk-control-matrix", name: "Risk Control Matrix (RCM)", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "control-register", name: "Control Register", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "comprehensive-risk-report", name: "Comprehensive Risk Report", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "enterprise-risk-summary", name: "Enterprise Risk Summary", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor", "Read-Only / Board Viewer"] },
  { id: "departmental-risk-summary", name: "Departmental Risk Summary", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor", "Read-Only / Board Viewer"] },
  { id: "division-risk-summary", name: "Division Risk Summary", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor", "Read-Only / Board Viewer"] },
  { id: "quarterly-report", name: "Quarterly Report", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "root-cause-report", name: "Root Cause Report", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "risk-consequences-report", name: "Risk Consequences Report", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "kri-breached-report", name: "KRI Breached Report", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "departmental-risk-detail", name: "Departmental Risk Detail", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
  { id: "division-risk-detail", name: "Division Risk Detail", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] },
];

const isReportAllowed = (role: string, reportId: string) => {
  const report = reportDefinitions.find((item) => item.id === reportId);
  return report ? report.allowedRoles.includes(role) : false;
};

const getReportName = (reportId: string) =>
  reportDefinitions.find((item) => item.id === reportId)?.name || reportId;

router.get("/metadata", authenticateToken, (req: any, res: any) => {
  res.json({
    reportTypes: reportDefinitions.map((report) => ({
      ...report,
      allowed: isReportAllowed(req.user.role, report.id),
    })),
  });
});

router.post("/generate", authenticateToken, async (req: any, res: any) => {
  const { reportId } = req.body;
  if (!reportId) return res.status(400).json({ error: "reportId is required." });
  if (!isReportAllowed(req.user.role, reportId)) {
    return res.status(403).json({ error: "You are not authorized to generate this report." });
  }

  await prisma.reportAudit.create({
    data: {
      reportId,
      reportName: getReportName(reportId),
      action: "generated",
      userId: req.user.id
    }
  });

  const [risks, controls, assets, treatmentPlans, riskControlMappings] = await Promise.all([
    prisma.risk.findMany(),
    prisma.control.findMany(),
    prisma.asset.findMany(),
    prisma.treatmentPlan.findMany(),
    prisma.riskControlMapping.findMany()
  ]);

  res.json({
    reportId,
    reportName: getReportName(reportId),
    generatedAt: new Date().toISOString(),
    risks, controls, assets, treatmentPlans, riskControlMappings
  });
});

router.post("/:reportId/export", authenticateToken, async (req: any, res: any) => {
  const { reportId } = req.params;
  if (!isReportAllowed(req.user.role, reportId)) {
    return res.status(403).json({ error: "You are not authorized to export this report." });
  }

  await prisma.reportAudit.create({
    data: {
      reportId,
      reportName: getReportName(reportId),
      action: "exported",
      userId: req.user.id
    }
  });

  res.json({ message: "Export job queued successfully." });
});

router.get("/audit-trail", authenticateToken, async (req: any, res: any) => {
  if (!["Administrator", "Compliance Officer", "CRO / Executive", "Internal Auditor"].includes(req.user.role)) {
    return res.status(403).json({ error: "Not authorized to view report audit trails." });
  }

  const reportId = typeof req.query.reportId === "string" ? req.query.reportId : undefined;
  const where = reportId ? { reportId } : {};

  const auditTrail = await prisma.reportAudit.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  res.json({ auditTrail });
});

export default router;
