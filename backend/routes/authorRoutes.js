import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import roleCheck from "../middleware/roleCheck.js";
import {
  listAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor
} from "../controllers/authorController.js";
import { validateBody } from "../middleware/validate.js";
import { createBookSchema, updateBookSchema } from "../validators/book.validation.js";
import { simpleCache, clearCacheOnWrite } from "../middleware/cache.js";

const router = express.Router();

// GET routes with caching (1 hour cache)
router.get("/", simpleCache(3600), listAuthors);
router.get("/:id", simpleCache(3600), getAuthor);

// Write routes with cache clearing
router.post("/", verifyJWT, roleCheck(["admin"]), validateBody(createBookSchema), clearCacheOnWrite(), createAuthor);
router.put("/:id", verifyJWT, roleCheck(["admin"]), validateBody(updateBookSchema), clearCacheOnWrite(), updateAuthor);
router.delete("/:id", verifyJWT, roleCheck(["admin"]), clearCacheOnWrite(), deleteAuthor);

export default router;