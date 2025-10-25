import { Router } from "express";
import { uploadProductImage } from "../controllers/uploadpic.controller";
import { upload } from '../middleware/multer' // make sure this points to your Multer setup

const uploadRouter = Router();

// Use Multer's .single("image") to parse the file from FormData
uploadRouter.post("/image", upload.single("image"), uploadProductImage);

export default uploadRouter;
