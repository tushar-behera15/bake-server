import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { createPaymentSchema, updatePaymentStatusSchema } from "../validation/payment.validation";
import { validateRequest } from "../middleware/validate.middleware";

const paymentRouter = Router();

paymentRouter.post("/", validateRequest(createPaymentSchema), paymentController.createPayment);
paymentRouter.post("/verify", paymentController.verifyPayment);
paymentRouter.get("/", paymentController.getPaymentsByUser);
paymentRouter.get("/:orderId", paymentController.getPaymentByOrder);

paymentRouter.patch("/:id/status", validateRequest(updatePaymentStatusSchema), paymentController.updatePaymentStatus);

export default paymentRouter;
