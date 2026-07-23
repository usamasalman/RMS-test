import jwt from "jsonwebtoken";
import { Permission, ROLE_PERMISSIONS } from "../types/roles";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_grc_key_for_dev";

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const requirePermission = (...permissions: Permission[]) => (req: any, res: any, next: any) => {
  const userRole = req.user?.role;
  const userPermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  
  const hasPermission = permissions.some(p => userPermissions.includes(p));
  if (!hasPermission) {
    return res.status(403).json({
      error: `Your role (${userRole}) does not have permission for this action.`,
      required: permissions,
    });
  }
  next();
};
