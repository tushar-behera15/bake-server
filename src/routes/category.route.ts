import { Router } from "express";
import * as category from "../controllers/category.controller";
import { optionalAuth } from "../middleware/auth";

const categoryrouter = Router();

categoryrouter.get("/", optionalAuth, category.getCategories);
categoryrouter.get("/:id", category.getCategoryById);
categoryrouter.post("/", category.createCategory);
categoryrouter.put("/:id", category.updateCategory);
categoryrouter.delete("/:id", category.deleteCategory);

export default categoryrouter;
