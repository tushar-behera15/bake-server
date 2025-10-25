import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { prisma } from "../utils/database";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: convert buffer to stream
function bufferToStream(buffer: Buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

// Controller
export const uploadProductImage = async (req: Request, res: Response) => {
    try {
        // ✅ Check if file exists
        if (!req.file) return res.status(400).json({ error: "No file provided" });

        const { productId, isThumbnail } = req.body;
        if (!productId) return res.status(400).json({ error: "productId is required" });

        // Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "products" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            bufferToStream(req.file!.buffer).pipe(uploadStream);
        });

        // Insert record into ProductImage table
        const productImage = await prisma.productImage.create({
            data: {
                productId: Number(productId),
                url: result.secure_url,
                isThumbnail: isThumbnail === "true" ? true : false,
            },
        });

        return res.json({
            message: "Image uploaded successfully",
            productImage,
        });
    } catch (err) {
        console.error("❌ Upload image error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};
