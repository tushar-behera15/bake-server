import { z } from "zod";

export const createOrderSchema = z.object({
  buyerId: z.number().int().positive(),
  addressId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).nonempty("items array must not be empty"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
