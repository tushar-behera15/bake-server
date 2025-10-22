import express, { Router } from "express";
import * as product from "../controllers/product.controller";

const productrouter = Router();

productrouter.get("/", product.getProducts);
productrouter.get("/:id", product.getProductById);
productrouter.post("/", product.createProduct);
productrouter.put("/:id", product.updateProduct);
productrouter.delete("/:id", product.deleteProduct);

export default productrouter;
