import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getStockHistory,
  createStockMovement,
} from "../controllers/stock.controller";

const router = Router();

router.get("/", authenticate, getStockHistory);
router.post("/", authenticate, createStockMovement);

export default router;