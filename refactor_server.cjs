const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add the import for ROLE_PERMISSIONS at the top
if (!code.includes('import { ROLE_PERMISSIONS }')) {
  code = code.replace(
    'import type { Role } from "./src/types";',
    'import type { Role, Permission } from "./src/types";\nimport { ROLE_PERMISSIONS } from "./src/types/roles";'
  );
}

// Add the requirePermission middleware
const middlewareStr = `
  const requirePermission = (...permissions: Permission[]) => (req: any, res: any, next: any) => {
    const userRole = req.user?.role;
    const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
    
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    if (!hasPermission) {
      // createAuditEntry will be added in WS1
      return res.status(403).json({
        error: \`Your role (\${userRole}) does not have permission for this action.\`,
        required: permissions,
      });
    }
    next();
  };
`;

if (!code.includes('const requirePermission =')) {
  code = code.replace(
    '  // Login Endpoint',
    middlewareStr + '\n  // Login Endpoint'
  );
}

// Map of endpoints to permissions
const endpointMap = [
  { match: /app\.get\("\/api\/v1\/admin\/users", authenticateToken, \(req: any, res: any\) => \{\n    if \(req\.user\.role !== "Administrator"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Administrator access required\." \}\);\n    \}/, replacement: 'app.get("/api/v1/admin/users", authenticateToken, requirePermission("user:read"), (req: any, res: any) => {' },
  
  // Risks
  { match: /app\.get\("\/api\/v1\/risks", authenticateToken, \(req, res\) => \{/, replacement: 'app.get("/api/v1/risks", authenticateToken, requirePermission("risk:read"), (req, res) => {' },
  { match: /app\.post\("\/api\/v1\/risks", authenticateToken, \(req, res\) => \{\n    \/\/ Basic RBAC Example: Only Admin or Risk Owner can create\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\n        \.status\(403\)\n        \.json\(\{ error: "Internal Auditors cannot create risks\." \}\);\n    \}/, replacement: 'app.post("/api/v1/risks", authenticateToken, requirePermission("risk:create"), (req, res) => {' },
  { match: /app\.put\("\/api\/v1\/risks\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\n        \.status\(403\)\n        \.json\(\{ error: "Internal Auditors cannot update risks\." \}\);\n    \}/, replacement: 'app.put("/api/v1/risks/:id", authenticateToken, requirePermission("risk:update"), (req, res) => {' },
  { match: /app\.delete\("\/api\/v1\/risks\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\n        \.status\(403\)\n        \.json\(\{ error: "Internal Auditors cannot delete risks\." \}\);\n    \}/, replacement: 'app.delete("/api/v1/risks/:id", authenticateToken, requirePermission("risk:delete"), (req, res) => {' },

  // Risk Control Mappings
  { match: /app\.get\("\/api\/v1\/risk-control-mappings", authenticateToken, \(req, res\) => \{/, replacement: 'app.get("/api/v1/risk-control-mappings", authenticateToken, requirePermission("risk:read", "control:read"), (req, res) => {' },
  { match: /app\.post\("\/api\/v1\/risk-control-mappings", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot link controls\." \}\);\n    \}/, replacement: 'app.post("/api/v1/risk-control-mappings", authenticateToken, requirePermission("risk:update"), (req, res) => {' },
  { match: /app\.delete\("\/api\/v1\/risk-control-mappings", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot unlink controls\." \}\);\n    \}/, replacement: 'app.delete("/api/v1/risk-control-mappings", authenticateToken, requirePermission("risk:update"), (req, res) => {' },

  // Controls
  { match: /app\.get\("\/api\/v1\/controls", authenticateToken, \(req, res\) => \{/, replacement: 'app.get("/api/v1/controls", authenticateToken, requirePermission("control:read"), (req, res) => {' },
  { match: /app\.post\("\/api\/v1\/controls", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot create controls\." \}\);\n    \}/, replacement: 'app.post("/api/v1/controls", authenticateToken, requirePermission("control:create"), (req, res) => {' },
  { match: /app\.put\("\/api\/v1\/controls\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot update controls\." \}\);\n    \}/, replacement: 'app.put("/api/v1/controls/:id", authenticateToken, requirePermission("control:update"), (req, res) => {' },
  { match: /app\.delete\("\/api\/v1\/controls\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot delete controls\." \}\);\n    \}/, replacement: 'app.delete("/api/v1/controls/:id", authenticateToken, requirePermission("control:delete"), (req, res) => {' },

  // Treatments
  { match: /app\.get\("\/api\/v1\/treatments", authenticateToken, \(req, res\) => \{/, replacement: 'app.get("/api/v1/treatments", authenticateToken, requirePermission("treatment:read"), (req, res) => {' },
  { match: /app\.post\("\/api\/v1\/treatments", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot create treatment plans\." \}\);\n    \}/, replacement: 'app.post("/api/v1/treatments", authenticateToken, requirePermission("treatment:create"), (req, res) => {' },
  { match: /app\.put\("\/api\/v1\/treatments\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot update treatment plans\." \}\);\n    \}/, replacement: 'app.put("/api/v1/treatments/:id", authenticateToken, requirePermission("treatment:update"), (req, res) => {' },
  { match: /app\.delete\("\/api\/v1\/treatments\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot delete treatment plans\." \}\);\n    \}/, replacement: 'app.delete("/api/v1/treatments/:id", authenticateToken, requirePermission("treatment:delete"), (req, res) => {' },

  // Assets
  { match: /app\.get\("\/api\/v1\/assets", authenticateToken, \(req, res\) => \{/, replacement: 'app.get("/api/v1/assets", authenticateToken, requirePermission("asset:read"), (req, res) => {' },
  { match: /app\.post\("\/api\/v1\/assets", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot create assets\." \}\);\n    \}/, replacement: 'app.post("/api/v1/assets", authenticateToken, requirePermission("asset:create"), (req, res) => {' },
  { match: /app\.put\("\/api\/v1\/assets\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot update assets\." \}\);\n    \}/, replacement: 'app.put("/api/v1/assets/:id", authenticateToken, requirePermission("asset:update"), (req, res) => {' },
  { match: /app\.delete\("\/api\/v1\/assets\/:id", authenticateToken, \(req, res\) => \{\n    if \(\(req as any\)\.user\.role === "Internal Auditor"\) \{\n      return res\.status\(403\)\.json\(\{ error: "Internal Auditors cannot delete assets\." \}\);\n    \}/, replacement: 'app.delete("/api/v1/assets/:id", authenticateToken, requirePermission("asset:delete"), (req, res) => {' },

];

for (const {match, replacement} of endpointMap) {
  code = code.replace(match, replacement);
}

fs.writeFileSync('server.ts', code, 'utf8');
console.log('Successfully refactored server.ts');
