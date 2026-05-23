const mongoose = require("mongoose");

/**
 * Listing Schema
 * A listing is created by a host.
 * Type examples: "hotel", "apartment", "dorm", "guest_room"
 */
const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Listing name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Listing type is required"],
      // TODO: Optionally restrict to enum values e.g. ["hotel", "apartment", "dorm", "guest_room"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // URL string (file upload is optional per spec)
      // TODO: (Optional) Implement file upload using multer
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },
  },
  { timestamps: true }
);

listingSchema.index({ name: "text", location: "text" });

module.exports = mongoose.model("Listing", listingSchema);
