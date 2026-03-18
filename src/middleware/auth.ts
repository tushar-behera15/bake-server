import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../utils/database";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: "SELLER" | "BUYER" | "ADMIN";
    };
}

export const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const payload: any = verifyToken(token);

        let role = payload.role;
        // fallback to DB if role is missing in token (old tokens)
        if (!role) {
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            role = user?.role;
        }

        req.user = {
            id: payload.userId,
            role: role,
        };

        return next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
