import mongoose from "mongoose";
import validator from "validator";
import Address from "./userAddress.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    addresses: [Address],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

