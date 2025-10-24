import { prisma } from "../utils/database";
import { Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
/**
 * ✅ Get all products
 */
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
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { shopId, categoryId } = req.query;

        const products = await prisma.product.findMany({
            where: {
                ...(shopId && { shopId: parseInt(shopId.toString()) }),
                ...(categoryId && { categoryId: parseInt(categoryId.toString()) }),
                isActive: true,
            },
            include: {
                category: true,
                shop: { select: { name: true } },
                images: true,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(products);
    } catch (error) {
        console.error("❌ GET products error:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

/**
 * ✅ Get a single product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                shop: { select: { name: true } },
                images: true,
            },
        });

        if (!product)
            return res.status(404).json({ message: "Product not found" });

        return res.json(product);
    } catch (error) {
        console.error("❌ GET product error:", error);
        return res.status(500).json({ message: "Failed to fetch product" });
    }
};

/**
 * ✅ Create a new product
 */

export const createProduct = async (req: Request, res: Response) => {
    try {
        // 1️⃣ Extract token from cookie
        const ownerId = getOwnerId(req);
        if (!ownerId)
            return res.status(401).json({ message: "Unauthorized — No token found" });


        // 3️⃣ Find seller’s shop
        const shop = await prisma.shop.findFirst({ where: { ownerId } });
        if (!shop)
            return res.status(403).json({ message: "You must register a shop before adding products" });

        // 4️⃣ Extract product data from request body
        const { name, description, price, quantity, sku, categoryId, isActive } = req.body;

        if (!name || price === undefined || quantity === undefined)
            return res.status(400).json({ message: "Missing required fields" });

        // 5️⃣ Create product linked to the seller’s shop
        const newProduct = await prisma.product.create({
            data: {
                name: name.toString(),
                description: description ? description.toString() : null,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                sku: sku ? sku.toString() : null,
                categoryId: categoryId ? parseInt(categoryId) : null,
                shopId: shop.id,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            },
        });

        return res.status(201).json({
            message: "Product created successfully",
            product: newProduct,
        });
    } catch (error) {
        console.error("❌ POST product error:", error);
        return res.status(500).json({ message: "Failed to create product" });
    }
};


/**
 * ✅ Update a product
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { name, description, price, quantity, categoryId, isActive } =
            req.body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(quantity && { quantity: parseInt(quantity) }),
                ...(categoryId && { categoryId: parseInt(categoryId) }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error("❌ PUT product error:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
};

/**
 * ✅ Delete a product
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        await prisma.product.delete({ where: { id } });

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("❌ DELETE product error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};
