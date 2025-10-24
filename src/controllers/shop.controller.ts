import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { verifyToken } from "../utils/jwt";

// Helper to get ownerId from JWT in cookies
const getOwnerId = (req: Request): number | null => {
    try {
        const token = req.cookies?.token;
        if (!token) return null;
        const payload: any = verifyToken(token);
        return payload.userId;
    } catch (err) {
        return null;
    }
};

// Create a new shop
export const createShop = async (req: Request, res: Response) => {
    try {
        const ownerId = getOwnerId(req);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const { name, address, description, contactEmail, contactNumber } = req.body;
        if (!name || !address || !contactEmail) {
            return res.status(400).json({ message: "Name, address, and email are required" });
        }

        // Check if shop already exists
        const existingShop = await prisma.shop.findUnique({
            where: { contactEmail },
        });
        if (existingShop) {
            return res.status(400).json({ message: "Shop with this email already exists" });
        }

        // Create shop
        const shop = await prisma.shop.create({
            data: { name, address, description, contactEmail, contactNumber, ownerId },
        });

        // Update user's role to 'SELLER' (enum)
        const user = await prisma.user.findUnique({ where: { id: ownerId } });
        if (user && user.role !== "SELLER") {
            await prisma.user.update({
                where: { id: ownerId },
                data: { role: "SELLER" }, // Prisma enum value
            });
        }

        return res.status(201).json({ shop });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create shop" });
    }
};


// Get all shops
export const getShops = async (_req: Request, res: Response) => {
    try {
        const shops = await prisma.shop.findMany({
            include: { products: true },
        });
        return res.json({ shops });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch shops" });
    }
};

// Get the logged-in owner's shop
export const getMyShop = async (req: Request, res: Response) => {
    try {
        const ownerId = getOwnerId(req);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const shop = await prisma.shop.findFirst({
            where: { ownerId },
            include: {
                products: { include: { category: true } }
            },
        });

        if (!shop) return res.status(404).json({ message: "Shop not found" });

        return res.json({ shop });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch your shop" });
    }
};

// Update the logged-in owner's shop
export const updateShop = async (req: Request, res: Response) => {
    try {
        const ownerId = getOwnerId(req);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const { name, address, description, contactEmail, contactNumber } = req.body;

        const updatedShop = await prisma.shop.updateMany({
            where: { ownerId },
            data: { name, address, description, contactEmail, contactNumber },
        });

        return res.json({ message: "Shop updated", updatedShop });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update shop" });
    }
};

// Delete the logged-in owner's shop
export const deleteShop = async (req: Request, res: Response) => {
    try {
        const ownerId = getOwnerId(req);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        await prisma.shop.deleteMany({ where: { ownerId } });

        return res.json({ message: "Shop deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete shop" });
    }
};
