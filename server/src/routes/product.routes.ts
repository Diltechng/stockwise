import { Router } from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

import { authenticate } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Staff & Admin
router.get("/", authenticate, getProducts);
router.get("/:id", authenticate, getProduct);

// Admin Only
router.post("/", authenticate, isAdmin, createProduct);
router.put("/:id", authenticate, isAdmin, updateProduct);
router.delete("/:id", authenticate, isAdmin, deleteProduct);

export default router;