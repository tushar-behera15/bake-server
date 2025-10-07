import { z } from "zod";

// Register
export const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

// Login
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Reset password
export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});
