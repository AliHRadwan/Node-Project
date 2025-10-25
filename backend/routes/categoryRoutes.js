import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { validateBody } from "../middleware/validate.js";
import { createCategory as createSchema, updateCategory as updateSchema } from "../validators/category.validation.js";
import { simpleCache, clearCacheOnWrite } from "../middleware/cache.js";

const router = express.Router();

// GET routes with caching (1 hour cache)
router.get("/", simpleCache(3600), listCategories);
router.get("/:id", simpleCache(3600), getCategory);

// Write routes with cache clearing
router.post("/", verifyJWT, roleCheck(["admin"]), validateBody(createSchema), clearCacheOnWrite(), createCategory);
router.put("/:id", verifyJWT, roleCheck(["admin"]), validateBody(updateSchema), clearCacheOnWrite(), updateCategory);
router.delete("/:id", verifyJWT, roleCheck(["admin"]), clearCacheOnWrite(), deleteCategory);

export default router ;
