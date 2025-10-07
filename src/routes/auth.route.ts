import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import {  loginSchema, registerSchema,  } from "../validation/auth.validation";
import { validateRequest } from "../middleware/validate.middleware";

const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), auth.register);
authRouter.post("/login", validateRequest(loginSchema), auth.login);
authRouter.get("/verify-email", auth.verifyEmail);

export default authRouter;
