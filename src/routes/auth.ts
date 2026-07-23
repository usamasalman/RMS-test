import express from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { authenticateToken, requirePermission } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_grc_key_for_dev";

router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.password === password) { // in real world, use bcrypt
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" },
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/signup", async (req: any, res: any) => {
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
      role: role || "Risk Owner",
    }
  });

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
  res.json({ token, user: { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name } });
});

router.put("/profile", authenticateToken, async (req: any, res: any) => {
  const { name } = req.body;
  const userId = req.user.id;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name }
  });

  const newToken = jwt.sign(
    { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name },
    JWT_SECRET,
    { expiresIn: "24h" },
  );

  res.json({ token: newToken, user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name } });
});

router.get("/me", authenticateToken, async (req: any, res: any) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

export default router;
