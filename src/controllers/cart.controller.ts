import { prisma } from "../utils/database";
import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

// Format cart item for frontend
const formatCartItem = (item: any) => ({
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    userId: item.userId,
    product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        categoryId: item.product.categoryId,
    } : null,
});

// =======================
// GET user's cart
// =======================
export const getCart = async (req: Request, res: Response) => {
    const token = req.cookies?.token;
    const payload: any = verifyToken(token);
    const userId = payload.userId;

    try {
        const cartItems = await prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        images: {
                            orderBy: { isThumbnail: "desc" }, // thumbnail first
                        },
                    },
                },
            },
        });

        const formatted = cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                imageUrl:
                    item.product.images.find((img) => img.isThumbnail)?.url ||
                    item.product.images[0]?.url ||
                    "/placeholder.jpg",
            },
        }));

        return res.json(formatted);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to load cart" });
    }
};

// =======================
// ADD product to cart
// =======================
export const addToCart = async (req: Request, res: Response) => {
    const token = req.cookies?.token;
    const payload: any = verifyToken(token);
    const userId = payload.userId;
    const { productId, quantity } = req.body;

    if (!userId || !productId)
        return res.status(400).json({ message: "userId and productId are required" });

    try {
        // If item already exists → increase quantity
        const existingItem = await prisma.cart.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingItem) {
            const updatedItem = await prisma.cart.update({
                where: {
                    userId_productId: {
                        userId,
                        productId,
                    },
                },
                data: {
                    quantity: existingItem.quantity + (quantity || 1),
                },
                include: { product: true },
            });

            return res.json(formatCartItem(updatedItem));
        }

        // If item does not exist → create new
        const newItem = await prisma.cart.create({
            data: {
                userId,
                productId,
                quantity: quantity || 1,
            },
            include: { product: true },
        });

        return res.status(201).json(formatCartItem(newItem));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to add to cart" });
    }
};

// =======================
// UPDATE cart item quantity
// =======================
export const updateCart = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0)
        return res.status(400).json({ message: "Quantity must be greater than 0" });

    try {
        const updatedItem = await prisma.cart.update({
            where: { id: parseInt(id) },
            data: { quantity },
            include: { product: true },
        });

        return res.json(formatCartItem(updatedItem));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update cart item" });
    }
};

// =======================
// DELETE item from cart
// =======================
export const deleteCartItem = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.cart.delete({
            where: { id: parseInt(id) },
        });

        return res.json({ message: "Item removed from cart" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete cart item" });
    }
};

// =======================
// CLEAR full cart of a user
// =======================
export const clearCart = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        await prisma.cart.deleteMany({
            where: { userId: parseInt(userId) },
        });

        return res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to clear cart" });
    }
};
