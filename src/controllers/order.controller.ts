import { Request, Response } from "express";
import { prisma } from "../utils/database";

export const createOrder = async (req: Request, res: Response) => {
  const { buyerId, addressId, items } = req.body;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Calculate totalAmount
      const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      // 2. Create order
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          addressId,
          totalAmount,
          status: "PENDING",
        },
      });

      // 3. Insert order items
      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: newOrder.id,
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrdersByBuyer = async (req: Request, res: Response) => {
  const { buyerId } = req.query;

  try {
    const orders = await prisma.order.findMany({
      where: {
        buyerId: parseInt(buyerId as string),
      },
      include: {
        items: true,
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrdersByShop = async (req: Request, res: Response) => {
  const { shopId } = req.params;

  try {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              shopId: parseInt(shopId),
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error("Error fetching shop orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
