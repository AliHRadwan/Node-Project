const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  listAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor
} = require("../controllers/authorController");
const { validateBody } = require("../middleware/validate");
const { createAuthor: createSchema, updateAuthor: updateSchema } = require("../validators/author.validation");

const router = express.Router();

router.get("/", listAuthors);
router.get("/:id", getAuthor);
router.post("/", requireAuth, requireAdmin, validateBody(createSchema), createAuthor);
router.put("/:id", requireAuth, requireAdmin, validateBody(updateSchema), updateAuthor);
router.delete("/:id", requireAuth, requireAdmin, deleteAuthor);

module.exports = router;
