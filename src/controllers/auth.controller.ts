import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken, verifyToken } from "../utils/jwt";
import { prisma } from "../utils/database";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ message: "Email exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, phone ,isEmailVerified: true},
  });

  // TODO: send verification email
  return res.status(201).json({user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email:email, isEmailVerified:true, isActive:true } });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = signToken({ userId: user.id });
 return res.json({ token });
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