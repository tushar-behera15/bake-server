import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken, verifyToken } from "../utils/jwt";
import { prisma } from "../utils/database";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body;
  console.log("Incoming data:", req.body);
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "Email exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, phone, isEmailVerified: true },
  });

  // TODO: send verification email
  return res.status(201).json({ user });
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isEmailVerified || !user.isActive)
    return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = signToken({ userId: user.id });

  // Exclude password from user object
  const { password: _, ...userData } = user;

  // Set cookie
  res.cookie("token", token, {
    httpOnly: true, // cannot be accessed via JS
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return res.json({ message: "Login successful" });
};



export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query as { token: string };
  try {
    const payload: any = verifyToken(token); // or use verifyToken
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isEmailVerified: true },
    });
    res.json({ message: "Email verified" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.json({ message: "Logged out successfully" });
};

export const me = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ user: null });

    const payload: any = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.json({ user: user || null });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
};

