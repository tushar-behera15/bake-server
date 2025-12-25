import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: "SELLER" | "BUYER";
    };
}

export const requireAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const payload: any = verifyToken(token);

        req.user = {
            id: payload.userId,
            role: payload.role,
        };

        return next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
