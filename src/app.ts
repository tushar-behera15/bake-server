import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger = require("./middleware/logger");
import { setupSwagger } from "./docs/swagger";
import authRouter from "./routes/auth.route";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger.logger);

// Routes
app.use("/api/auth", authRouter);

setupSwagger(app)

export default app;
