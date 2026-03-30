import { prisma } from "../utils/database";
import { sendEmail } from "../utils/email";

export const checkLowStockAndNotify = async (productId: number) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        shop: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!product) return;

    if (product.stock_quantity <= product.low_stock_threshold) {
      console.warn(`[LOW STOCK ALERT] Product "${product.name}" is low on stock (${product.stock_quantity}/${product.low_stock_threshold}).`);
      
      const sellerEmail = product.shop.owner.email;
      const subject = `⚠️ Low Stock Alert: ${product.name}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #d9534f;">Low Stock Alert</h2>
          <p>Hello <strong>${product.shop.owner.name}</strong>,</p>
          <p>Your product <strong>"${product.name}"</strong> in shop <strong>"${product.shop.name}"</strong> has reached a low stock level.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p><strong>Current Stock:</strong> ${product.stock_quantity}</p>
            <p><strong>Low Stock Threshold:</strong> ${product.low_stock_threshold}</p>
          </div>
          <p>Please restock soon to ensure continued sales.</p>
          <hr />
          <p style="font-size: 12px; color: #777;">This is an automated notification from Bake Server.</p>
        </div>
      `;

      try {
        await sendEmail(sellerEmail, subject, html);
        console.log(`Low stock notification sent to ${sellerEmail}`);
      } catch (emailError) {
        console.error("Failed to send low stock email:", emailError);
      }
    }
  } catch (error) {
    console.error("Error in checkLowStockAndNotify:", error);
  }
};
