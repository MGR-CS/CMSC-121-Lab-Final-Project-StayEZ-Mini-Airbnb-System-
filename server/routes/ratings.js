const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const Rating = require("../models/Rating");
const { protect, authorize } = require("../middleware/auth");

/**
 * @route   GET /api/ratings
 * @desc    Get all ratings
 * @access  Public
 */
router.get("/", async (req, res) => {
    try{
        const ratings = await Rating.find({});
        res.status(200).json(ratings);
    }
    catch(error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route   GET /api/ratings/my
 * @desc    Get all ratings
 * @access  Public
 */
router.get("/my", protect, authorize("guest"), async (req, res) => {
    try{
        const guestId = req.user._id;
        const ratings = await Rating.find({guestId: guestId});

        res.status(200).json(ratings || []);
    }
    catch(error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route   GET /api/ratings/host
 * @desc    Get all reviews for properties owned by the logged-in host
 * @access  Private (Host only)
 */
router.get("/host", protect, authorize("host"), async (req, res) => {
    try {
        const ratings = await Rating.find({ hostId: req.user._id })
            .populate("listingId", "name")
            .populate("guestId", "name");

        res.status(200).json(ratings || []);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

/**
 * @route   POST /api/ratings
 * @desc    Create or Update a stay verification review
 * @access  Private (Guest only)
 */
router.post("/", protect, authorize("guest"), async (req, res) => {
    try {
        const { bookingId, stars, comment } = req.body;
        const guestId = req.user._id; // Securely pulled from login token!

        if (!bookingId || !stars) {
            return res.status(400).json({ message: "Booking ID and star values are required." });
        }

        const verifiedBooking = await Booking.findById(bookingId).populate("listingId");
        if (!verifiedBooking) {
            return res.status(404).json({ message: "Stay booking record not found." });
        }

        if (String(verifiedBooking.guestId) !== String(guestId)) {
            return res.status(403).json({ message: "Unauthorized to rate this stay." });
        }

        const listingId = verifiedBooking.listingId._id;
        const hostId = verifiedBooking.listingId.hostId;

        const review = await Rating.findOneAndUpdate(
            { bookingId },
            {
                bookingId,
                listingId,
                guestId,
                hostId,
                stars: Number(stars),
                comment: comment ? comment.trim() : ""
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(201).json({ success: true, data: review });

    } catch (error) {
        res.status(500).json({ message: "Server Error saving review", error: error.message });
    }
});


module.exports = router;