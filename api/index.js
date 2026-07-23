var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/risk-utils.ts
var risk_utils_exports = {};
__export(risk_utils_exports, {
  computeControlRating: () => computeControlRating,
  computeInherentRiskScore: () => computeInherentRiskScore,
  computePostTreatmentRRS: () => computePostTreatmentRRS,
  computeResidualRiskScore: () => computeResidualRiskScore,
  getRiskColor: () => getRiskColor,
  getRiskLevel: () => getRiskLevel,
  getRiskTextColor: () => getRiskTextColor
});
function computeInherentRiskScore(likelihood, impact, cia_c, cia_i, cia_a) {
  const l = likelihood || 0;
  const i = impact || 0;
  const c = cia_c || 0;
  const ci = cia_i || 0;
  const a = cia_a || 0;
  const ciaScore = (c + ci + a) / 3;
  return parseFloat((l * i * ciaScore).toFixed(2)) || 0;
}
function computeControlRating(controls) {
  if (!controls?.length) return 0;
  const totalWeight = controls.reduce((s, c) => s + (c.weight || 0), 0);
  if (totalWeight === 0) return 0;
  const weightedScore = controls.reduce((s, c) => {
    const cs = ((c.design_eff || 0) * 0.4 + (c.operating_eff || 0) * 0.6) / 100;
    return s + cs * (c.weight || 0);
  }, 0);
  return parseFloat((weightedScore / totalWeight).toFixed(4)) || 0;
}
function computeResidualRiskScore(irs, cr) {
  return parseFloat(((irs || 0) * (1 - (cr || 0))).toFixed(2)) || 0;
}
function computePostTreatmentRRS(rrs, progressPct) {
  return parseFloat((rrs * (1 - progressPct / 100)).toFixed(2));
}
function getRiskLevel(score) {
  if (score <= 20) return "Low";
  if (score <= 50) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}
function getRiskColor(level) {
  switch (level) {
    case "Low":
      return "bg-green-500";
    case "Moderate":
      return "bg-amber-400";
    case "High":
      return "bg-orange-500";
    case "Critical":
      return "bg-red-700";
    default:
      return "bg-slate-500";
  }
}
function getRiskTextColor(level) {
  switch (level) {
    case "Low":
      return "text-green-700 bg-green-50 border border-green-200";
    case "Moderate":
      return "text-amber-800 bg-amber-50 border border-amber-200";
    case "High":
      return "text-orange-800 bg-orange-50 border border-orange-200";
    case "Critical":
      return "text-red-800 bg-red-50 border border-red-200";
    default:
      return "text-slate-700 bg-slate-50";
  }
}
var init_risk_utils = __esm({
  "src/lib/risk-utils.ts"() {
  }
});

// api/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_express9 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);

// src/routes/auth.ts
var import_express = __toESM(require("express"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = global.prisma || new import_client.PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// src/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/types/roles.ts
var ROLE_PERMISSIONS = {
  "Administrator": [
    "risk:create",
    "risk:read",
    "risk:update",
    "risk:delete",
    "risk:approve_critical",
    "risk:approve_high",
    "risk:approve_moderate",
    "risk:submit",
    "risk:import",
    "control:create",
    "control:read",
    "control:update",
    "control:delete",
    "treatment:create",
    "treatment:read",
    "treatment:update",
    "treatment:delete",
    "asset:create",
    "asset:read",
    "asset:update",
    "asset:delete",
    "evidence:upload",
    "evidence:read",
    "evidence:delete",
    "audit:read",
    "audit:export",
    "report:generate",
    "report:export",
    "report:schedule",
    "user:manage",
    "user:read"
  ],
  "CRO / Executive": [
    "risk:create",
    "risk:read",
    "risk:update",
    "risk:submit",
    "risk:approve_critical",
    "risk:approve_high",
    "risk:approve_moderate",
    "risk:import",
    "control:create",
    "control:read",
    "control:update",
    "treatment:create",
    "treatment:read",
    "treatment:update",
    "asset:create",
    "asset:read",
    "asset:update",
    "evidence:upload",
    "evidence:read",
    "audit:read",
    "report:generate",
    "report:export",
    "report:schedule",
    "user:read"
  ],
  "Compliance Officer": [
    "risk:create",
    "risk:read",
    "risk:update",
    "risk:submit",
    "risk:approve_high",
    "risk:approve_moderate",
    "control:create",
    "control:read",
    "control:update",
    "treatment:create",
    "treatment:read",
    "treatment:update",
    "asset:create",
    "asset:read",
    "asset:update",
    "evidence:upload",
    "evidence:read",
    "audit:read",
    "report:generate",
    "report:export",
    "user:read"
  ],
  "Risk Owner": [
    "risk:create",
    "risk:read",
    "risk:update",
    "risk:submit",
    "risk:approve_moderate",
    "control:create",
    "control:read",
    "control:update",
    "treatment:create",
    "treatment:read",
    "treatment:update",
    "asset:read",
    "evidence:upload",
    "evidence:read",
    "report:generate",
    "report:export",
    "user:read"
  ],
  "Internal Auditor": [
    "risk:read",
    "control:read",
    "treatment:read",
    "asset:read",
    "evidence:upload",
    "evidence:read",
    "audit:read",
    "audit:export",
    "report:generate",
    "report:export",
    "user:read"
  ],
  "Read-Only / Board Viewer": [
    "risk:read",
    "control:read",
    "treatment:read",
    "asset:read",
    "evidence:read",
    "report:generate",
    "report:export"
  ]
};

// src/middleware/auth.ts
var JWT_SECRET = process.env.JWT_SECRET || "super_secret_grc_key_for_dev";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
var requirePermission = (...permissions) => (req, res, next) => {
  const userRole = req.user?.role;
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  const hasPermission = permissions.some((p) => userPermissions.includes(p));
  if (!hasPermission) {
    return res.status(403).json({
      error: `Your role (${userRole}) does not have permission for this action.`,
      required: permissions
    });
  }
  next();
};

// src/routes/auth.ts
var router = import_express.default.Router();
var JWT_SECRET2 = process.env.JWT_SECRET || "super_secret_grc_key_for_dev";
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      const token = import_jsonwebtoken2.default.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET2,
        { expiresIn: "24h" }
      );
      return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "Login failed" });
  }
});
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        name,
        role: role || "Risk Owner"
      }
    });
    const token = import_jsonwebtoken2.default.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET2,
      { expiresIn: "24h" }
    );
    return res.json({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name } });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: error.message || "Signup failed" });
  }
});
router.put("/profile", authenticateToken, async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name }
  });
  const newToken = import_jsonwebtoken2.default.sign(
    { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name },
    JWT_SECRET2,
    { expiresIn: "24h" }
  );
  res.json({ token: newToken, user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name } });
});
router.get("/me", authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});
var auth_default = router;

// src/routes/risks.ts
var import_express2 = __toESM(require("express"), 1);

// src/lib/audit.ts
var computeFieldDiff = (oldRecord, newRecord) => {
  if (!oldRecord && !newRecord) return [];
  if (!oldRecord) {
    return Object.keys(newRecord).map((field) => ({ field, oldValue: null, newValue: newRecord[field] }));
  }
  if (!newRecord) {
    return Object.keys(oldRecord).map((field) => ({ field, oldValue: oldRecord[field], newValue: null }));
  }
  const fields = /* @__PURE__ */ new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
  const diff = [];
  for (const field of fields) {
    if (["updated_at", "updatedAt", "createdAt"].includes(field)) continue;
    const oldVal = oldRecord[field];
    const newVal = newRecord[field];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff.push({ field, oldValue: oldVal, newValue: newVal });
    }
  }
  return diff;
};
var getNextVersion = async (entityType, entityId) => {
  const count = await prisma.snapshot.count({
    where: { entityType, entityId }
  });
  return count + 1;
};
var createSnapshot = async (entityType, entityId, version, data, userId, trigger) => {
  const snapshot = await prisma.snapshot.create({
    data: {
      entityType,
      entityId,
      version,
      data: JSON.parse(JSON.stringify(data)),
      createdBy: userId
    }
  });
  return snapshot.id;
};
async function createAuditEntry(entityType, entityId, entityCode, action, user, oldRecord, newRecord, req, note) {
  const fieldChanges = computeFieldDiff(oldRecord, newRecord);
  let snapshotId = void 0;
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
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
      userAgent: req.headers["user-agent"],
      note,
      fieldChanges,
      snapshotId
    }
  });
  return entry;
}

// src/routes/risks.ts
var router2 = import_express2.default.Router();
router2.get("/", authenticateToken, requirePermission("risk:read"), async (req, res) => {
  const risks = await prisma.risk.findMany({
    include: {
      controlMappings: { include: { control: true } },
      treatmentPlans: true,
      owner: { select: { id: true, name: true, role: true } }
    }
  });
  res.json({ risks });
});
router2.get("/:id", authenticateToken, requirePermission("risk:read"), async (req, res) => {
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
router2.post("/", authenticateToken, requirePermission("risk:create"), async (req, res) => {
  const { id, controlMappings, treatmentPlans, owner, kris, createdAt, updatedAt, rootCauseId, ...dataToCreate } = req.body;
  const newRisk = await prisma.risk.create({ data: dataToCreate });
  await createAuditEntry("risk", newRisk.id, newRisk.code, "create", req.user, null, newRisk, req);
  await updateRiskScores(newRisk.id);
  res.json(newRisk);
});
router2.put("/:id", authenticateToken, requirePermission("risk:update"), async (req, res) => {
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
router2.delete("/:id", authenticateToken, requirePermission("risk:delete"), async (req, res) => {
  const oldRisk = await prisma.risk.findUnique({ where: { id: req.params.id } });
  if (!oldRisk) return res.status(404).json({ error: "Not found" });
  await prisma.risk.delete({ where: { id: req.params.id } });
  await createAuditEntry("risk", oldRisk.id, oldRisk.code, "delete", req.user, oldRisk, null, req);
  res.status(204).send();
});
async function updateRiskScores(riskId) {
  const risk = await prisma.risk.findUnique({
    where: { id: riskId },
    include: { controlMappings: { include: { control: true } }, treatmentPlans: true }
  });
  if (!risk) return;
  const { computeInherentRiskScore: computeInherentRiskScore2, computeResidualRiskScore: computeResidualRiskScore2, computePostTreatmentRRS: computePostTreatmentRRS2, getRiskLevel: getRiskLevel2 } = await Promise.resolve().then(() => (init_risk_utils(), risk_utils_exports));
  const inherentScore = computeInherentRiskScore2(
    risk.likelihood,
    risk.impact,
    risk.cia_c || 3,
    risk.cia_i || 3,
    risk.cia_a || 3
  );
  const controls = risk.controlMappings.map((m) => m.control);
  const residualScore = computeResidualRiskScore2(inherentScore, controls);
  const treatmentProgress = risk.treatmentPlans.reduce((acc, plan) => acc + plan.progress, 0) / (risk.treatmentPlans.length || 1);
  const postTreatmentScore = computePostTreatmentRRS2(residualScore, treatmentProgress);
  const riskLevel = getRiskLevel2(postTreatmentScore);
  await prisma.risk.update({
    where: { id: riskId },
    data: { inherentScore, residualScore, postTreatmentScore, riskLevel }
  });
}
var risks_default = router2;

// src/routes/controls.ts
var import_express3 = __toESM(require("express"), 1);
var router3 = import_express3.default.Router();
router3.get("/", authenticateToken, requirePermission("control:read"), async (req, res) => {
  const controls = await prisma.control.findMany({
    include: { owner: { select: { id: true, name: true, role: true } } }
  });
  res.json({ controls });
});
router3.post("/", authenticateToken, requirePermission("control:create"), async (req, res) => {
  const { id, riskMappings, treatments, owner, createdAt, updatedAt, ...dataToCreate } = req.body;
  const newControl = await prisma.control.create({ data: dataToCreate });
  await createAuditEntry("control", newControl.id, newControl.code, "create", req.user, null, newControl, req);
  res.json(newControl);
});
router3.put("/:id", authenticateToken, requirePermission("control:update"), async (req, res) => {
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
router3.delete("/:id", authenticateToken, requirePermission("control:delete"), async (req, res) => {
  const oldControl = await prisma.control.findUnique({ where: { id: req.params.id } });
  if (!oldControl) return res.status(404).json({ error: "Not found" });
  await prisma.control.delete({ where: { id: req.params.id } });
  await createAuditEntry("control", oldControl.id, oldControl.code, "delete", req.user, oldControl, null, req);
  res.status(204).send();
});
var controls_default = router3;

// src/routes/treatments.ts
var import_express4 = __toESM(require("express"), 1);
var router4 = import_express4.default.Router();
router4.get("/", authenticateToken, requirePermission("treatment:read"), async (req, res) => {
  const treatmentPlans = await prisma.treatmentPlan.findMany({
    include: { owner: { select: { id: true, name: true, role: true } } }
  });
  res.json({ treatmentPlans });
});
router4.post("/", authenticateToken, requirePermission("treatment:create"), async (req, res) => {
  const { title, description, riskId, strategy, ownerId, progress, deadline, mappedControlId } = req.body;
  const newPlan = await prisma.treatmentPlan.create({
    data: {
      title,
      description,
      riskId,
      strategy,
      ownerId,
      progress,
      mappedControlId,
      deadline: new Date(deadline)
    }
  });
  await createAuditEntry("treatment", newPlan.id, void 0, "create", req.user, null, newPlan, req);
  res.json(newPlan);
});
router4.put("/:id", authenticateToken, requirePermission("treatment:update"), async (req, res) => {
  const oldPlan = await prisma.treatmentPlan.findUnique({ where: { id: req.params.id } });
  if (!oldPlan) return res.status(404).json({ error: "Not found" });
  const { deadline, ...rest } = req.body;
  const newPlan = await prisma.treatmentPlan.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...deadline && { deadline: new Date(deadline) }
    }
  });
  await createAuditEntry("treatment", oldPlan.id, void 0, "update", req.user, oldPlan, newPlan, req);
  res.json(newPlan);
});
router4.delete("/:id", authenticateToken, requirePermission("treatment:delete"), async (req, res) => {
  const oldPlan = await prisma.treatmentPlan.findUnique({ where: { id: req.params.id } });
  if (!oldPlan) return res.status(404).json({ error: "Not found" });
  await prisma.treatmentPlan.delete({ where: { id: req.params.id } });
  await createAuditEntry("treatment", oldPlan.id, void 0, "delete", req.user, oldPlan, null, req);
  res.status(204).send();
});
var treatments_default = router4;

// src/routes/assets.ts
var import_express5 = __toESM(require("express"), 1);
var router5 = import_express5.default.Router();
router5.get("/", authenticateToken, requirePermission("asset:read"), async (req, res) => {
  const assets = await prisma.asset.findMany({
    include: { owner: { select: { id: true, name: true, role: true } } }
  });
  res.json({ assets });
});
router5.post("/", authenticateToken, requirePermission("asset:create"), async (req, res) => {
  const { id, owner, risks, createdAt, updatedAt, ...dataToCreate } = req.body;
  const newAsset = await prisma.asset.create({ data: dataToCreate });
  await createAuditEntry("asset", newAsset.id, newAsset.code, "create", req.user, null, newAsset, req);
  res.json(newAsset);
});
router5.put("/:id", authenticateToken, requirePermission("asset:update"), async (req, res) => {
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
router5.delete("/:id", authenticateToken, requirePermission("asset:delete"), async (req, res) => {
  const oldAsset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!oldAsset) return res.status(404).json({ error: "Not found" });
  await prisma.asset.delete({ where: { id: req.params.id } });
  await createAuditEntry("asset", oldAsset.id, oldAsset.code, "delete", req.user, oldAsset, null, req);
  res.status(204).send();
});
var assets_default = router5;

// src/routes/mappings.ts
var import_express6 = __toESM(require("express"), 1);
var router6 = import_express6.default.Router();
router6.get("/", authenticateToken, requirePermission("risk:read", "control:read"), async (req, res) => {
  const riskControlMappings = await prisma.riskControlMapping.findMany();
  res.json({ riskControlMappings });
});
router6.post("/", authenticateToken, requirePermission("risk:update"), async (req, res) => {
  const { riskId, controlId, weight } = req.body;
  const existing = await prisma.riskControlMapping.findUnique({
    where: { riskId_controlId: { riskId, controlId } }
  });
  const mapping = await prisma.riskControlMapping.upsert({
    where: { riskId_controlId: { riskId, controlId } },
    update: { weight },
    create: { riskId, controlId, weight }
  });
  await createAuditEntry("mapping", `${riskId}-${controlId}`, void 0, existing ? "update" : "create", req.user, existing, mapping, req);
  res.json(mapping);
});
router6.delete("/", authenticateToken, requirePermission("risk:update"), async (req, res) => {
  const { riskId, controlId } = req.body;
  const existing = await prisma.riskControlMapping.findUnique({
    where: { riskId_controlId: { riskId, controlId } }
  });
  if (existing) {
    await prisma.riskControlMapping.delete({
      where: { riskId_controlId: { riskId, controlId } }
    });
    await createAuditEntry("mapping", `${riskId}-${controlId}`, void 0, "delete", req.user, existing, null, req);
  }
  res.status(204).send();
});
var mappings_default = router6;

// src/routes/audit.ts
var import_express7 = __toESM(require("express"), 1);
var router7 = import_express7.default.Router();
router7.get("/audit-log", authenticateToken, requirePermission("audit:read"), async (req, res) => {
  const { entityType, entityId, limit = "50" } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const where = {};
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  const logs = await prisma.auditLog.findMany({
    where,
    take: isNaN(parsedLimit) ? 50 : parsedLimit,
    orderBy: { timestamp: "desc" }
  });
  res.json({ auditLog: logs });
});
router7.get("/snapshots/:id", authenticateToken, requirePermission("audit:read"), async (req, res) => {
  const snapshot = await prisma.snapshot.findUnique({
    where: { id: req.params.id }
  });
  if (!snapshot) {
    return res.status(404).json({ error: "Snapshot not found" });
  }
  res.json({ snapshot });
});
var audit_default = router7;

// src/routes/reports.ts
var import_express8 = __toESM(require("express"), 1);
var router8 = import_express8.default.Router();
var reportDefinitions = [
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
  { id: "division-risk-detail", name: "Division Risk Detail", allowedRoles: ["Administrator", "CRO / Executive", "Risk Owner", "Compliance Officer", "Internal Auditor"] }
];
var isReportAllowed = (role, reportId) => {
  const report = reportDefinitions.find((item) => item.id === reportId);
  return report ? report.allowedRoles.includes(role) : false;
};
var getReportName = (reportId) => reportDefinitions.find((item) => item.id === reportId)?.name || reportId;
router8.get("/metadata", authenticateToken, (req, res) => {
  res.json({
    reportTypes: reportDefinitions.map((report) => ({
      ...report,
      allowed: isReportAllowed(req.user.role, report.id)
    }))
  });
});
router8.post("/generate", authenticateToken, async (req, res) => {
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
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    risks,
    controls,
    assets,
    treatmentPlans,
    riskControlMappings
  });
});
router8.post("/:reportId/export", authenticateToken, async (req, res) => {
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
router8.get("/audit-trail", authenticateToken, async (req, res) => {
  if (!["Administrator", "Compliance Officer", "CRO / Executive", "Internal Auditor"].includes(req.user.role)) {
    return res.status(403).json({ error: "Not authorized to view report audit trails." });
  }
  const reportId = typeof req.query.reportId === "string" ? req.query.reportId : void 0;
  const where = reportId ? { reportId } : {};
  const auditTrail = await prisma.reportAudit.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });
  res.json({ auditTrail });
});
var reports_default = router8;

// api/index.ts
var app = (0, import_express9.default)();
app.use((0, import_cors.default)());
app.use(import_express9.default.json());
app.use("/api/v1/auth", auth_default);
app.use("/api/v1/risks", risks_default);
app.use("/api/v1/controls", controls_default);
app.use("/api/v1/treatments", treatments_default);
app.use("/api/v1/assets", assets_default);
app.use("/api/v1/risk-control-mappings", mappings_default);
app.use("/api/v1/reports", reports_default);
app.use("/api/v1", audit_default);
app.get("/api/v1/admin/users", authenticateToken, requirePermission("user:read"), async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  res.json({ users });
});
var index_default = app;
