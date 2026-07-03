import { Router } from "express";

import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";

import { authenticate } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

// Staff & Admin
router.get("/", authenticate, getCategories);
router.get("/:id", authenticate, getCategory);

// Admin Only
router.post("/", authenticate, isAdmin, createCategory);
router.put("/:id", authenticate, isAdmin, updateCategory);
router.delete("/:id", authenticate, isAdmin, deleteCategory);

export default router;