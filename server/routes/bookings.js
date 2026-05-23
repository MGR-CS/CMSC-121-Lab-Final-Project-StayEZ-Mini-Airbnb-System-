const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { protect, authorize } = require("../middleware/auth");

/**
 * @route   GET /api/bookings/my
 * @desc    Get all bookings made by the logged-in guest
 * @access  Private - Guest
 */
router.get("/my", protect, authorize("guest"), async (req, res) => {
  try {
    const guestId = req.user._id;
    const myBookings = await Booking.find({ guestId: guestId })
        .populate("listingId")
        .lean();

    const finalBookings = [];

    for (const match of myBookings) {

      // Strip the contact number if the booking isn't approved yet
      if (match.status !== "approved" && match.listingId) {
        delete match.listingId.contactNumber;
      }

      finalBookings.push(match);
    }

    res.status(200).json(finalBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/bookings/host
 * @desc    Get all booking requests for listings owned by the logged-in host
 * @access  Private - Host
 */
router.get("/host", protect, authorize("host"), async (req, res) => {
  try {
    const hostListings = await Listing.find({ hostId: req.user._id }).lean();
    const listingIds = hostListings.map(listing => listing._id);

    const hostBookings = await Booking.find({ listingId: { $in: listingIds } })
        .populate("guestId", "name email")
        .populate("listingId", "name")
        .lean();

    res.status(200).json(hostBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/bookings
 * @desc    Get ALL bookings (admin only)
 * @access  Private - Admin
 */
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    // TODO: Return all bookings, populate listing and guest info

    res.status(200).json({ message: "TODO: return all bookings" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (guest books a listing)
 * @access  Private - Guest
 */
router.post("/", protect, authorize("guest"), async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const guestId = req.user._id;

    // we only need one to trigger a conflict
    const sameListing = await Booking.findOne({
      listingId: listingId,
      status: "approved",
      startDate: { $lt: endDate },
      endDate: { $gt: startDate }
    })

    if(sameListing) {
      res.status(409).json({ message: "Conflicting schedule with another existing booking"})
    }

    const newBooking = await Booking.create({
      listingId: listingId,
      guestId: guestId,
      startDate: startDate,
      endDate: endDate,
      status: "pending",
    })

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Approve or reject a booking (host only)
 * @access  Private - Host
 */
router.put("/:id/status", protect, authorize("host"), async (req, res) => {
  try {
    const { status } = req.body; // expected: "approved" or "rejected"

    // TODO: Find booking by req.params.id
    // TODO: Ensure the booking's listing belongs to req.user (host ownership check)
    // TODO: Validate status is "approved" or "rejected"
    // TODO: If approving, re-run overlap check to avoid race conditions
    // TODO: Update booking.status and save

    res.status(200).json({ message: "TODO: update booking status" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
