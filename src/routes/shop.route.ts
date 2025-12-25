import { Router } from "express";
import * as shop from "../controllers/shop.controller";
import { requireAuth } from "../middleware/auth";

const shoprouter = Router();

shoprouter.post("/register", shop.createShop);
shoprouter.get("/me", requireAuth, shop.getMyShop);
shoprouter.get("/:id", requireAuth, shop.deleteShop);
shoprouter.get("/", requireAuth, shop.getShops);
shoprouter.get("/:id", requireAuth, shop.updateShop);
export default shoprouter;
