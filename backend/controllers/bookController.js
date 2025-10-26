// backend/controllers/bookController.js
import mongoose from "mongoose";
import Book from "../models/Book.js";
import { wssBroadcast } from "../utils/websocket.js";

// -------------------- BUILD FILTERS --------------------
const buildFilters = (q) => {
  const filter = {};

  // full-text search
  if (q.q) filter.$text = { $search: String(q.q) };

  // isActive may arrive as "true"/"false" or boolean (if validated)
  if (typeof q.isActive === "boolean") {
    filter.isActive = q.isActive;
  } else if (q.isActive !== undefined) {
    filter.isActive = String(q.isActive) === "true";
  }

  // author/category ids (accept validated or raw string)
  if (q.author) filter.authors = new mongoose.Types.ObjectId(String(q.author));
  if (q.category) filter.categories = new mongoose.Types.ObjectId(String(q.category));

  // price range
  const min = q.minPrice != null ? Number(q.minPrice) : null;
  const max = q.maxPrice != null ? Number(q.maxPrice) : null;
  if (min != null || max != null) {
    filter.price = {};
    if (min != null) filter.price.$gte = min;
    if (max != null) filter.price.$lte = max;
  }

  return filter;
};

// -------------------- LIST BOOKS (pagination + filters + projection + safe sort) --------------------
// GET /api/books
export const listBooks = async (req, res) => {
  try {
    // pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;

    // sorting (whitelist)
    const allowedSorts = new Set(["price", "-price", "createdAt", "-createdAt", "title", "-title"]);
    const sort = allowedSorts.has(req.query.sort) ? req.query.sort : "-createdAt";

    // filters
    const filter = buildFilters(req.query);

    // projection (optional): ?fields=title,price,image
    let projection = null;
    if (req.query.fields) {
      projection = String(req.query.fields)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" "); // mongoose select syntax
    }

    const [items, total] = await Promise.all([
      Book.find(filter, projection)
        .populate("authors", "name")
        .populate("categories", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Book.countDocuments(filter),
    ]);

    const pages = Math.max(Math.ceil(total / limit), 1);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    res.json({
      meta: { total, page, limit, pages, hasNext, hasPrev, sort, filterApplied: filter },
      items,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- OTHER CRUD HANDLERS (unchanged) --------------------
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authors", "name")
      .populate("categories", "name slug");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const newBook = req.body;
    if (!newBook.title || newBook.price === undefined || newBook.stock === undefined || newBook.pdfUrl === undefined || newBook.image.url === undefined) {
      return res.status(400).json({ message: "title, price, stock, pdfUrl, and image.url are required" });
    }
    const book = await Book.create(newBook);

    wssBroadcast({
      type: "NEW_BOOK",
      payload: newBook
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const hard = req.query.hard === "true";
    if (hard) {
      const deleted = await Book.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Book not found" });
      return res.json({ message: "Book permanently deleted" });
    } else {
      const updated = await Book.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Book not found" });
      return res.json({ message: "Book deactivated", book: updated });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
