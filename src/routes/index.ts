import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "🚀 Express + TypeScript server running!" });
});

export default router;
