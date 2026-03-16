import { Request, Response } from "express";
import { prisma } from "../utils/database";

export const addOrderItem = async (req: Request, res: Response) => {
  const { orderId, productId, price, quantity } = req.body;

  try {
    const newItem = await prisma.orderItem.create({
      data: {
        orderId: parseInt(orderId),
        productId,
        price,
        quantity,
      },
    });

    // Update order totalAmount
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        totalAmount: {
          increment: price * quantity,
        },
      },
    });

    return res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding order item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrderItems = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    const items = await prisma.orderItem.findMany({
      where: { orderId: parseInt(orderId) },
    });

    return res.json(items);
  } catch (error) {
    console.error("Error fetching order items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeOrderItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedItem = await prisma.orderItem.delete({
      where: { id: parseInt(id) },
    });

    // Update order totalAmount
    await prisma.order.update({
      where: { id: deletedItem.orderId },
      data: {
        totalAmount: {
          decrement: deletedItem.price * deletedItem.quantity,
        },
      },
    });

    return res.json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Error removing order item:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
