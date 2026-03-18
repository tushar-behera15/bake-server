import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.validation";
import { validateRequest } from "../middleware/validate.middleware";

const orderRouter = Router();
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";

orderRouter.post("/", validateRequest(createOrderSchema), orderController.createOrder);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.get("/", orderController.getOrdersByBuyer);
orderRouter.get("/shop/me", requireAuth, orderController.getMyShopOrders);
orderRouter.get("/shop/:shopId", orderController.getOrdersByShop);
orderRouter.patch("/:id/status", validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);
orderRouter.get("/all/admin", requireAuth, requireRole("ADMIN"), orderController.getAllOrders);

export default orderRouter;
