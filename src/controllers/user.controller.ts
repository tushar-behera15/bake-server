import { Request, Response } from "express";
import { prisma } from "../utils/database";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isEmailVerified: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return res.json(users);
    } catch (err) {
        console.error("Error fetching all users:", err);
        return res.status(500).json({ message: "Failed to fetch users" });
    }
};
