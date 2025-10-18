import mongoose from "mongoose";

const { Schema } = mongoose;

const ImageSchema = new Schema(
  { url: String, key: String },
  { _id: false }
);

const BookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "Stock must be an integer" },
    },
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    image: ImageSchema,
    pdfUrl: { type: String, match: [/^https?:\/\/.+/, "Invalid URL format"] },
    isbn: String,
    sku: String,
    publisher: String,
    language: String,
    publishedAt: Date,

    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ----------------------------------------------------------------
   Indexes to support filtering, search, and sorting efficiently
------------------------------------------------------------------*/

// Text search on title + description for `?q=`
BookSchema.index({ title: "text", description: "text" });

// ⚡ Common filter fields
BookSchema.index({ authors: 1 });
BookSchema.index({ categories: 1 });
BookSchema.index({ price: 1 });
BookSchema.index({ isActive: 1 });

//  Compound index for faster default sort queries (active + createdAt desc)
BookSchema.index({ isActive: 1, createdAt: -1 });

//  Optional: sort + filter by rating or stock in future features
BookSchema.index({ ratingAvg: -1 });
BookSchema.index({ stock: 1 });

export default mongoose.model("Book", BookSchema);