import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  listAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor
} from "../controllers/authorController.js";
import { validateBody } from "../middleware/validate.js";
import { createBook as createSchema, updateBook as updateSchema } from "../validators/book.validation.js";

const router = express.Router();

router.get("/", listAuthors);
router.get("/:id", getAuthor);
router.post("/", requireAuth, requireAdmin, validateBody(createSchema), createAuthor);
router.put("/:id", requireAuth, requireAdmin, validateBody(updateSchema), updateAuthor);
router.delete("/:id", requireAuth, requireAdmin, deleteAuthor);

export default router;