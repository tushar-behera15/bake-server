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

        const { name, address, description, contactEmail, contactNumber, latitude, longitude } = req.body;
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
            data: { 
                name, 
                address, 
                description, 
                contactEmail, 
                contactNumber, 
                ownerId,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null
            },
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
export const getShops = async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius } = req.query as { lat?: string; lng?: string; radius?: string };

        const shops = await prisma.shop.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    include: {
                        images: true,
                        category: true,
                    },
                },
            },
        });

        // Add distance and sort if lat/lng are provided
        let resultShops = shops.map((shop: any) => {
            let distance = null;
            if (lat && lng && shop.latitude !== null && shop.longitude !== null) {
                const userLat = parseFloat(lat);
                const userLng = parseFloat(lng);

                // Ensure we have valid numbers before calculating
                if (!isNaN(userLat) && !isNaN(userLng)) {
                    distance = calculateDistance(
                        userLat,
                        userLng,
                        shop.latitude,
                        shop.longitude
                    );
                }
            }
            return { ...shop, distance };
        });

        // Filter by radius if provided
        if (radius) {
            const rad = parseFloat(radius);
            if (!isNaN(rad)) {
                resultShops = resultShops.filter((s: any) => s.distance !== null && s.distance <= rad);
            }
        }

        // Sort by distance if provided
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            resultShops.sort((a: any, b: any) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        return res.json({ shops: resultShops });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch shops" });
    }
};

// Helper: Haversine distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    
    // Clamp 'a' to [0, 1] to avoid NaN from sqrt due to floating point precision jitter
    const clampedA = Math.max(0, Math.min(1, a));
    const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
    return R * c;
}


// Get the logged-in owner's shop
export const getMyShop = async (req: Request, res: Response) => {
    try {
        const ownerId = getOwnerId(req);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const shop = await prisma.shop.findFirst({
            where: { ownerId },
            include: {
                owner: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                    },
                },
                products: {
                    include: {
                        images: true,
                        category: true,
                    },
                },
            },
        });



        if (!shop) return res.status(404).json({ message: "Shop not found" });

        return res.json({ shop });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch your shop" });
    }
};

// Get a single shop by ID
export const getShopById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const shop = await prisma.shop.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                products: {
                    include: {
                        images: true,
                        category: true,
                    },
                },
            },
        });

        if (!shop) return res.status(404).json({ message: "Shop not found" });

        return res.json({ shop });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch shop" });
    }
};

// Update the logged-in owner's shop
export const updateShop = async (req: Request, res: Response) => {
    try {
        const ownerId = getOwnerId(req);
        if (!ownerId) return res.status(401).json({ message: "Unauthorized" });

        const { name, address, description, contactEmail, contactNumber, latitude, longitude } = req.body;

        const updatedShop = await prisma.shop.updateMany({
            where: { ownerId },
            data: { 
                name, 
                address, 
                description, 
                contactEmail, 
                contactNumber,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined
            },
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
