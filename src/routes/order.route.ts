import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { createOrderSchema, updateOrderStatusSchema } from "../validation/order.validation";
import { validateRequest } from "../middleware/validate.middleware";

const orderRouter = Router();

orderRouter.post("/", validateRequest(createOrderSchema), orderController.createOrder);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.get("/", orderController.getOrdersByBuyer);
orderRouter.get("/shop/:shopId", orderController.getOrdersByShop);
orderRouter.patch("/:id/status", validateRequest(updateOrderStatusSchema), orderController.updateOrderStatus);

export default orderRouter;
