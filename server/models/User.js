import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "waiter", "chef", "helper"],
      required: true,
    },
    gender: {
      type: String,
      enum: ["lady", "gents"],
      default: null,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
