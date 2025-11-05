// controllers/authorController.js
import Author from "../models/Author.js";

/** 
 * Helper to build filters for admin list
 */
const buildFilter = (q = {}) => {
  const filter = {};
  if (q.status) filter.status = q.status;
  if (q.q) filter.name = { $regex: String(q.q), $options: "i" };
  return filter;
};

/**
 * GET /api/authors
 * Admin list (optional filters)
 */
export const listAuthors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "name";

    const filter = buildFilter(req.query);

    const [items, total] = await Promise.all([
      Author.find(filter)
        .populate("userId", "email username role")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Author.countDocuments(filter)
    ]);

    res.json({
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      items
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/authors/:id
 * Get single author profile
 */
export const getAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
      .populate("userId", "email username role");
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/authors/apply
 * User applies to become an author
 */
export const applyAsAuthor = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const existing = await Author.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({
        message: "You have already applied or are an author",
        author: existing
      });
    }

    const author = await Author.create({
      userId: req.user._id,
      name,
      bio,
      status: "pending",
      appliedAt: new Date()
    });

    res.status(201).json({ message: "Application submitted", author });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/authors/me
 * Get my own author profile/application
 */
export const getMyAuthor = async (req, res) => {
  try {
    const author = await Author.findOne({ userId: req.user._id });
    if (!author) return res.status(404).json({ message: "No author record found" });
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/authors/:id/approve
 * Admin approves an author
 */
export const approveAuthor = async (req, res) => {
  try {
    const update = {
      status: "approved",
      approvedAt: new Date(),
      rejectedAt: undefined,
      reason: undefined
    };

    if (req.body.name) update.name = req.body.name;
    if (req.body.bio !== undefined) update.bio = req.body.bio;

    const author = await Author.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json({ message: "Author approved", author });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/authors/:id/reject
 * Admin rejects an author
 */
export const rejectAuthor = async (req, res) => {
  try {
    const { reason } = req.body;
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectedAt: new Date(),
        reason
      },
      { new: true, runValidators: true }
    );

    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json({ message: "Author rejected", author });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/authors/:id
 * Admin hard deletes author record
 */
export const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.json({ message: "Author deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
