import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import {  loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../validation/auth.validation";
import { validateRequest } from "../middleware/validate.middleware";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), auth.register);
authRouter.post("/login", validateRequest(loginSchema), auth.login);
authRouter.get("/verify-email", auth.verifyEmail);
authRouter.post("/logout", auth.logout);
authRouter.get("/me", auth.me);

authRouter.post("/forgot-password", validateRequest(forgotPasswordSchema), auth.forgotPassword);
authRouter.post("/reset-password", validateRequest(resetPasswordSchema), auth.resetPassword);

export default authRouter;
