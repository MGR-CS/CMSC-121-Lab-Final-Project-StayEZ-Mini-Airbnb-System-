const mongoose = require("mongoose");

/**
 * Booking Schema
 * Status flow: "pending" → "approved" | "rejected"
 * A guest creates a booking (status = "pending").
 * A host updates the booking to "approved" or "rejected".
 */
const bookingSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    totalPrice: { 
      type: Number, 
      required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
