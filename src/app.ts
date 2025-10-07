import express from "express";
import helmet from "helmet";
import cors from "cors";
import logger = require("./middleware/logger");
import router from "./routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger.logger);

// Routes
app.use("/api", router);

export default app;
