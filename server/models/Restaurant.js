import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    subscriptionPlan: {
      type: String,
      default: "free",
      trim: true,
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;