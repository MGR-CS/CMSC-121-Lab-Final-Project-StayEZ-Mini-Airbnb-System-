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



module.exports = router;