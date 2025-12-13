import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger = require("./middleware/logger");
import { setupSwagger } from "./docs/swagger";
import authRouter from "./routes/auth.route";
import cookieParser from "cookie-parser";
import productrouter from "./routes/product.route";
import categoryrouter from "./routes/category.route";
import shoprouter from "./routes/shop.route";
import uploadRouter from "./routes/uploadpic.route";
import cartrouter from "./routes/cart.route";
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true,               // allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger.logger);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/product", productrouter);
app.use("/api/category", categoryrouter);
app.use("/api/shop", shoprouter);
app.use("/api/upload", uploadRouter);
app.use("/api/cart", cartrouter);
setupSwagger(app)

export default app;
