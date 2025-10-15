const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
} = require("../controllers/categoryController");
const { validateBody } = require("../middleware/validate");
const { createCategory: createSchema, updateCategory: updateSchema } = require("../validators/category.validation");

const router = express.Router();

router.get("/", listCategories);
router.get("/:id", getCategory);

router.post("/", requireAuth, requireAdmin, validateBody(createSchema), createCategory);
router.put("/:id", requireAuth, requireAdmin, validateBody(updateSchema), updateCategory);
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);

module.exports = router;
