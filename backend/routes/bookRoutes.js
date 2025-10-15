const express = require("express");
const {
  listBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { validateBody, validateQuery } = require("../middleware/validate");
const { createBook: createSchema, updateBook: updateSchema } = require("../validators/book.validation");
const { listBooksQuery } = require("../validators/book.query.validation");

const router = express.Router();

// ✅ validate query for list endpoint
router.get("/", validateQuery(listBooksQuery), listBooks);
router.get("/:id", getBook);

// ✅ admin-only write operations
router.post("/", requireAuth, requireAdmin, validateBody(createSchema), createBook);
router.put("/:id", requireAuth, requireAdmin, validateBody(updateSchema), updateBook);
router.delete("/:id", requireAuth, requireAdmin, deleteBook);

module.exports = router;
