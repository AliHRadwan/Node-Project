import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 chars"],
      maxlength: [80, "Name must be at most 80 chars"],
    },
    bio: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default mongoose.model("Author", AuthorSchema);
