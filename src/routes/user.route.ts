import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const userRoute = Router();

userRoute.get("/", requireAuth, requireRole("ADMIN"), userController.getAllUsers);

export default userRoute;
