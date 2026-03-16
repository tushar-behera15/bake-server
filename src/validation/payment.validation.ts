import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  amount: z.number().positive(),
  method: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "WALLET", "PAYPAL"]),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "SUCCESS", "COMPLETED", "FAILED", "REFUNDED"]),
});
