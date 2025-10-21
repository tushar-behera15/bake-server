import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger = require("./middleware/logger");
import { setupSwagger } from "./docs/swagger";
import authRouter from "./routes/auth.route";
import cookieParser from "cookie-parser";
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

setupSwagger(app)

export default app;
