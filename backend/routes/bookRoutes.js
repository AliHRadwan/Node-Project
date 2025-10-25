import express from "express";
import {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createBook as createSchema, updateBook as updateSchema } from "../validators/book.validation.js";
import { listBooksQuery } from "../validators/book.query.validation.js";
import  verifyJWT  from "../middleware/verifyJWT.js";

const router = express.Router();

// ✅ validate query for list endpoint
router.get("/", verifyJWT, validateQuery(listBooksQuery), listBooks);
router.get("/:id", verifyJWT, getBook);

// ✅ admin-only write operations
router.post("/", requireAuth, requireAdmin, validateBody(createSchema), createBook);
router.put("/:id", requireAuth, requireAdmin, validateBody(updateSchema), updateBook);
router.delete("/:id", requireAuth, requireAdmin, deleteBook);

export default router ;
