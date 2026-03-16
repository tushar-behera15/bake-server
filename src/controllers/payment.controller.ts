import { Request, Response } from "express";
import { prisma } from "../utils/database";

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

    // 3. Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: "PENDING",
      },
    });

    return res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
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
    });

    return res.json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
