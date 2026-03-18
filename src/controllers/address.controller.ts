import { Request, Response } from "express";
import { prisma } from "../utils/database";

export const createAddress = async (req: Request, res: Response) => {
  const { userId, label, line1, line2, city, state, postalCode, country, phone } = req.body;

  try {
    const address = await prisma.address.create({
      data: {
        userId,
        label,
        line1,
        line2,
        city,
        state,
        postalCode,
        country,
        phone,
      },
    });

    return res.status(201).json(address);
  } catch (error) {
    console.error("Error creating address:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAddressesByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: parseInt(userId) },
    });

    return res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedAddress = await prisma.address.update({
      where: { id: parseInt(id) },
      data,
    });

    return res.json(updatedAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.address.delete({
      where: { id: parseInt(id) },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
