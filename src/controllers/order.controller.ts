import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { verifyToken } from "../utils/jwt";
import { razorpay } from "../utils/razorpay";

const getOwnerId = (req: Request): number | null => {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const payload: any = verifyToken(token);
    return payload.userId;
  } catch (err) {
    return null;
  }
};

import { checkLowStockAndNotify } from "../services/alert.service";

export const createOrder = async (req: Request, res: Response) => {
  const { buyerId, addressId, items, idempotencyKey, paymentMethod } = req.body;

  try {
    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true, payment: true },
      });

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Order already exists (Idempotent)",
          orderId: existingOrder.id,
          ...existingOrder,
        });
      }
    }

    const { order, stockUpdates } = await prisma.$transaction(async (tx) => {
      // 2. Validate stock and deduct immediately (Atomic)
      const updates = [];
      for (const item of items) {
        try {
          const updatedProduct = await tx.product.update({
            where: {
              id: item.productId,
              stock_quantity: { gte: item.quantity }
            },
            data: {
              stock_quantity: { decrement: item.quantity }
            },
          });
          updates.push(updatedProduct);
        } catch (error: any) {
          // P2025: Record to update not found or condition not met
          throw new Error(`Out of Stock: Product ID ${item.productId}`);
        }
      }

      // 3. Calculate totalAmount
      const totalAmount = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      // 4. Create order
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          addressId,
          totalAmount,
          status: "PENDING",
          idempotencyKey,
        },
      });

      // 5. Insert order items
      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: newOrder.id,
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      return { order: newOrder, stockUpdates: updates };
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    let razorpayOrderId = null;
    let keyId = process.env.RAZORPAY_KEY_ID;

    if (paymentMethod !== "CASH") {
      // 6. Create Razorpay order
      const options = {
        amount: Math.round(order.totalAmount * 100), // in paise
        currency: "INR",
        receipt: `receipt_order_${order.id}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    }

    // 7. Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        method: paymentMethod === "CASH" ? "CASH" : (paymentMethod || "UPI"),
        status: "PENDING",
        razorpayOrderId: razorpayOrderId,
      },
    });

    // 8. Trigger Low Stock Alerts (Async)
    items.forEach((item: any) => {
      checkLowStockAndNotify(item.productId).catch(err => console.error("Alert trigger error:", err));
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.id,
      remainingStock: stockUpdates.map(p => ({ productId: p.id, stock: p.stock_quantity })),
      razorpay_order_id: razorpayOrderId,
      key_id: keyId,
    });
  } catch (error: any) {
    if (error.message.startsWith("Out of Stock")) {
      return res.status(400).json({ success: false, message: "Out of Stock" });
    }
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
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
    const orderId = parseInt(id);

    // 1. Update the Order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // 2. If status is PAID, also update the Payment record if it exists
    if (status === "PAID") {
      await prisma.payment.updateMany({
        where: { orderId: orderId },
        data: {
          status: "SUCCESS",
          paidAt: new Date()
        }
      });
    }

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

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
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
    console.error("Error fetching all orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyShopOrders = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const shop = await prisma.shop.findFirst({ where: { ownerId } });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              shopId: shop.id,
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
      orderBy: { createdAt: "desc" },
    });

    return res.json(orders);
  } catch (error) {
    console.error("Error fetching my shop orders:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
