import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { validateBody } from "../middleware/validate.js";
import { createCategory as createSchema, updateCategory as updateSchema } from "../validators/category.validation.js";

const router = express.Router();

router.get("/", listCategories);
router.get("/:id", getCategory);

router.post("/", requireAuth, requireAdmin, validateBody(createSchema), createCategory);
router.put("/:id", requireAuth, requireAdmin, validateBody(updateSchema), updateCategory);
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);

export default router ;
