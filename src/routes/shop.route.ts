import { Router } from "express";
import * as shop from "../controllers/shop.controller";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";

const shoprouter = Router();

shoprouter.post("/register", requireAuth, shop.createShop);
shoprouter.get("/me", requireAuth, shop.getMyShop);
shoprouter.put("/update", requireAuth, shop.updateShop);
shoprouter.get("/", shop.getShops);
shoprouter.get("/:id", shop.getShopById);
shoprouter.put("/:id", requireAuth, shop.updateShop);
shoprouter.delete("/:id", requireAuth, shop.deleteShop);
shoprouter.put("/admin/toggle-status/:id", requireAuth, requireRole("ADMIN"), shop.toggleShopStatus);
export default shoprouter;
