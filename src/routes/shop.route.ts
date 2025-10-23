import { Router } from "express";
import * as shop from "../controllers/shop.controller";

const shoprouter = Router();

shoprouter.post("/register", shop.createShop);
shoprouter.get("/:id", shop.getMyShop);
shoprouter.get("/:id", shop.deleteShop);
shoprouter.get("/", shop.getShops);
shoprouter.get("/:id", shop.updateShop);
export default shoprouter;
