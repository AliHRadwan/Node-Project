// controllers/bookController.js
import mongoose from "mongoose";
import Book from "../models/Book.js";
import Author from "../models/Author.js";
import { wssBroadcast } from "../utils/websocket.js";

// -------------------- Helpers --------------------
const buildFilters = (q) => {
  const filter = {};
  if (q.q) filter.$text = { $search: String(q.q) };
  if (typeof q.isActive === "boolean") {
    filter.isActive = q.isActive;
  } else if (q.isActive !== undefined) {
    filter.isActive = String(q.isActive) === "true";
  }
  if (q.author) filter.authors = new mongoose.Types.ObjectId(String(q.author));
  if (q.category) filter.categories = new mongoose.Types.ObjectId(String(q.category));
  const min = q.minPrice != null ? Number(q.minPrice) : null;
  const max = q.maxPrice != null ? Number(q.maxPrice) : null;
  if (min != null || max != null) {
    filter.price = {};
    if (min != null) filter.price.$gte = min;
    if (max != null) filter.price.$lte = max;
  }
  return filter;
};

// Helper: get approved author doc for current user
const getApprovedAuthor = async (userId) => {
  if (!userId) return null;
  return Author.findOne({ userId, status: "approved" }).lean();
};

// Helper: check if admin
const isAdmin = (req) => req?.user?.role === "admin";

// -------------------- LIST BOOKS --------------------
export const listBooks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;
    const allowedSorts = new Set(["price", "-price", "createdAt", "-createdAt", "title", "-title"]);
    const sort = allowedSorts.has(req.query.sort) ? req.query.sort : "-createdAt";
    const filter = buildFilters(req.query);

    let projection = null;
    if (req.query.fields) {
      projection = String(req.query.fields)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");
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

    res.json({
      meta: {
        total,
        page,
        limit,
        pages: Math.max(Math.ceil(total / limit), 1),
        sort,
        filterApplied: filter,
      },
      items,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- GET SINGLE BOOK --------------------
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

// -------------------- CREATE BOOK --------------------
export const createBook = async (req, res) => {
  try {
    const newBook = req.body;

    if (!newBook.title || newBook.price == null || newBook.stock == null) {
      return res.status(400).json({ message: "title, price, and stock are required" });
    }

    if (!isAdmin(req)) {
      const myAuthor = await getApprovedAuthor(req.user._id);
      if (!myAuthor) {
        return res.status(403).json({ message: "Only approved authors can create books" });
      }

      const myAuthorId = String(myAuthor._id);
      const authors = Array.isArray(newBook.authors) ? newBook.authors.map(String) : [];
      if (!authors.includes(myAuthorId)) {
        newBook.authors = [...authors, myAuthorId];
      }
    }

    const book = await Book.create(newBook);

    wssBroadcast({
      type: "NEW_BOOK",
      payload: book
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------- UPDATE BOOK --------------------
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!isAdmin(req)) {
      const myAuthor = await getApprovedAuthor(req.user._id);
      if (!myAuthor) {
        return res.status(403).json({ message: "Only approved authors can update books" });
      }

      const ownsBook = (book.authors || []).map(String).includes(String(myAuthor._id));
      if (!ownsBook) {
        return res.status(403).json({ message: "You can only update your own books" });
      }

      // prevent authors from reassigning ownership
      if (req.body.authors) delete req.body.authors;
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------- DELETE BOOK --------------------
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (!isAdmin(req)) {
      const myAuthor = await getApprovedAuthor(req.user._id);
      if (!myAuthor) {
        return res.status(403).json({ message: "Only approved authors can delete books" });
      }

      const ownsBook = (book.authors || []).map(String).includes(String(myAuthor._id));
      if (!ownsBook) {
        return res.status(403).json({ message: "You can only delete your own books" });
      }
    }

    const hard = req.query.hard === "true";
    if (hard) {
      await Book.findByIdAndDelete(req.params.id);
      return res.json({ message: "Book permanently deleted" });
    } else {
      const updated = await Book.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      return res.json({ message: "Book deactivated", book: updated });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
