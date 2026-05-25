const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

/**
 * @route   GET /api/favorites
 * @desc    Get ALL of guest's favorite listings by their IDs
 * @access  Private - guest
 */
router.get("/", protect, authorize("guest"), async (req, res) => {
    try {
        const guestId = req.user._id;
        const user = await User.findById(guestId, "favorites")

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        res.status(200).json(user.favorites || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/favorites/:id
 * @desc    Get ALL of guest's favorite listings by their IDs
 * @access  Private - guest
 */
router.post("/:id", protect, authorize("guest"), async (req, res) => {
    try {
        const guestId = req.user._id;
        const listingId = req.params.id;
        const addedFavorite = await User.findByIdAndUpdate(guestId, {
        $addToSet: { favorites: listingId },
        }, {new: true}).select("favorites");    // Add to guest's favorite list and return only the favorites with the guestid


        res.status(200).json(addedFavorite.favorites || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Delete a listing from user's database
 * @access  Private - guest
 */
router.delete("/:id", protect, authorize("guest"), async (req, res) => {
    try {
        const guestId = req.user._id;
        const listingId = req.params.id;
        const addedFavorite = await User.findByIdAndUpdate(guestId, {
            $pull: { favorites: listingId },
        }, {new: true}).select("favorites");    // Add to guest's favorite list and return only the favorites with the guestid

        if (!addedFavorite) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(addedFavorite.favorites || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;