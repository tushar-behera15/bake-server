import { Request, Response } from "express";
import { prisma } from "../utils/database";
import { razorpay } from "../utils/razorpay";
import crypto from "crypto";

export const createPayment = async (req: Request, res: Response) => {
  const { orderId, amount, method } = req.body;

  try {
    // 1. Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. Ensure payment amount equals order total
    if (amount !== order.totalAmount) {
      return res.status(400).json({ message: "Payment amount does not match order total" });
    }

    // 3. Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (e.g., ₹1.00 = 100 paise)
      currency: "INR",
      receipt: `receipt_order_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 4. Create/Update payment record in database
    const payment = await prisma.payment.upsert({
      where: { orderId: orderId },
      update: {
        amount,
        method,
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id,
      },
      create: {
        orderId,
        amount,
        method,
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return res.status(201).json({
      ...payment,
      razorpay_order_id: razorpayOrder.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // 1. Validate signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "");
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 2. Update payment and order status
    const updatedPayment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          status: "SUCCESS",
          paidAt: new Date(),
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });

      return payment;
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    return res.json({ message: "Payment verified successfully", payment: updatedPayment });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPaymentByOrder = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: parseInt(orderId) },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found for this order" });
    }

    return res.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedPayment = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: parseInt(id) },
        data: { 
          status,
          paidAt: status === "SUCCESS" ? new Date() : undefined,
        },
      });

      // Automatically update order status to PAID if payment is successful
      if (status === "SUCCESS") {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        });
      }

      return payment;
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    return res.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
import { verifyToken } from "../utils/jwt";

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

export const getPaymentsByUser = async (req: Request, res: Response) => {
  const { buyerId } = req.query;

  if (!buyerId) {
    return res.status(400).json({ message: "buyerId is required" });
  }

  try {
    const payments = await prisma.payment.findMany({
      where: {
        order: {
          buyerId: parseInt(buyerId as string),
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(payments);
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyShopPayments = async (req: Request, res: Response) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const shop = await prisma.shop.findFirst({ where: { ownerId } });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const payments = await prisma.payment.findMany({
      where: {
        order: {
          items: {
            some: {
              product: {
                shopId: shop.id,
              },
            },
          },
        },
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(payments);
  } catch (error) {
    console.error("Error fetching shop payments:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
