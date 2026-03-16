import { Router } from "express";
import * as orderItemController from "../controllers/orderItem.controller";
// Note: Validation could be added here similar to orders if needed
import { z } from "zod";
import { validateRequest } from "../middleware/validate.middleware";

const orderItemRouter = Router();

const addItemSchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

orderItemRouter.post("/", validateRequest(addItemSchema), orderItemController.addOrderItem);
orderItemRouter.get("/:orderId", orderItemController.getOrderItems);
orderItemRouter.delete("/:id", orderItemController.removeOrderItem);

export default orderItemRouter;
