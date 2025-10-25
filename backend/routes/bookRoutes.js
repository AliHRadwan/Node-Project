import express from "express";
import {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";
import verifyJWT from "../middleware/verifyJWT.js";
import roleCheck from "../middleware/roleCheck.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { createBook as createSchema, updateBook as updateSchema } from "../validators/book.validation.js";
import { listBooksQuery } from "../validators/book.query.validation.js";
import { simpleCache, clearCacheOnWrite } from "../middleware/cache.js";

const router = express.Router();

// GET routes with caching (30 minutes cache)
router.get("/", simpleCache(1800), validateQuery(listBooksQuery), listBooks);
router.get("/:id", simpleCache(1800), getBook);

// Write routes with cache clearing
router.post("/", verifyJWT, roleCheck(["admin"]), validateBody(createSchema), clearCacheOnWrite(), createBook);
router.put("/:id", verifyJWT, roleCheck(["admin"]), validateBody(updateSchema), clearCacheOnWrite(), updateBook);
router.delete("/:id", verifyJWT, roleCheck(["admin"]), clearCacheOnWrite(), deleteBook);


export default router ;
