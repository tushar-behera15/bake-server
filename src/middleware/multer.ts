import multer from "multer";

// Use memory storage so we can stream the file to Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({ storage });
