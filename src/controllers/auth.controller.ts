import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken, verifyToken } from "../utils/jwt";
import { prisma } from "../utils/database";
import crypto from "crypto";
import { sendEmail } from "../utils/email";
import { ENV } from "../config/env";

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

  const token = signToken({ userId: user.id, role: user.role });

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
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        shops: {
          select: {
            isActive: true
          }
        }
      },
    });

    return res.json({ user: user || null });
  } catch (err) {
    return res.status(401).json({ user: null });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security reasons, don't tell the user if the email doesn't exist
      return res.status(200).json({ message: "Password reset link sent to your email" });
    }

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it in the database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry (1 hour)
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(user.email, "Password Reset Request", message);

    return res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ 
      message: error.message || "Something went wrong",
      error: ENV.NODE_ENV === "development" ? error : undefined 
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    // Hash the received token to compare with the one in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching, valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and remove reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
