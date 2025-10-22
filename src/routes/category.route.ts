import express, { Router } from "express";
import * as category from "../controllers/category.controller";

const categoryrouter = Router();

categoryrouter.get("/", category.getCategories);
categoryrouter.get("/:id", category.getCategoryById);
categoryrouter.post("/", category.createCategory);
categoryrouter.put("/:id", category.updateCategory);
categoryrouter.delete("/:id", category.deleteCategory);

export default categoryrouter;
