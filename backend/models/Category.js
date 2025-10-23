import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 chars"],
      maxlength: [60, "Name must be at most 60 chars"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Slug is required"],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (e.g. web-development)"],
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);

// Unique index for slug
CategorySchema.index({ slug: 1 }, { unique: true });

// Auto-generate slug from name if not provided
CategorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default mongoose.model("Category", CategorySchema);
