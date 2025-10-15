const Category = require("../models/Category");

const listCategories = async (_req, res) => {
  const cats = await Category.find().sort("name");
  res.json(cats);
};

const getCategory = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: "Category not found" });
  res.json(cat);
};

const createCategory = async (req, res) => {
  const cat = await Category.create(req.body);
  res.status(201).json(cat);
};

const updateCategory = async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!cat) return res.status(404).json({ message: "Category not found" });
  res.json(cat);
};

const deleteCategory = async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted" });
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
