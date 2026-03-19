import { Router } from "express";
import * as shop from "../controllers/shop.controller";
import { requireAuth } from "../middleware/auth";

const shoprouter = Router();

shoprouter.post("/register", requireAuth, shop.createShop);
shoprouter.get("/me", requireAuth, shop.getMyShop);
shoprouter.get("/", shop.getShops);
shoprouter.get("/:id", shop.getShopById);
shoprouter.put("/:id", requireAuth, shop.updateShop);
shoprouter.delete("/:id", requireAuth, shop.deleteShop);
export default shoprouter;
