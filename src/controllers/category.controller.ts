import { prisma } from "../utils/database";
import { Request, Response } from "express";

// Helper function to format category for frontend
const formatCategory = (cat: any) => ({
    id: cat.id,
    name: cat.name,
    productCount: cat.products?.length || 0,
});


// GET all categories
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({ include: { products: true } });
        const result = categories.map(formatCategory);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

// GET single category by ID
export const getCategoryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: { products: true },
        });
        if (!category) return res.status(404).json({ message: "Category not found" });

        return res.json(formatCategory(category));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch category" });
    }
};

// CREATE new category
export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    try {
        const newCategory = await prisma.category.create({ data: { name } });
        // Return in the same format
        return res.status(201).json(formatCategory(newCategory));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create category" });
    }
};

// UPDATE category
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name },
            include: { products: true },
        });
        res.json(formatCategory(updatedCategory));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update category" });
    }
};

// DELETE category
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.category.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete category" });
    }
};
