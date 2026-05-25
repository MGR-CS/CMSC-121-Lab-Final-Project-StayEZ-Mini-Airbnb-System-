const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const { protect, authorize } = require("../middleware/auth");

// All routes here require authentication tska admin role
router.use(protect, authorize("admin"));

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users
 * @access  Private - Admin
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a single user by ID
 * @access  Private - Admin
 */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Change a user's role (guest / host / admin)
 * @access  Private - Admin
 * @body    { role: "guest" | "host" | "admin" }
 */
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["guest", "host", "admin"];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${allowedRoles.join(", ")}`,
      });
    }

    // Prevent an admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Admins cannot change their own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: `Role updated to '${role}'`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user and cascade-delete their listings and bookings
 * @access  Private - Admin
 */
router.delete("/users/:id", async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Admins cannot delete their own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cascade: remove all listings owned by this user, then their related bookings
    const userListings = await Listing.find({ hostId: user._id }).select("_id");
    const listingIds = userListings.map((l) => l._id);

    await Booking.deleteMany({ listingId: { $in: listingIds } }); // bookings on their listings
    await Booking.deleteMany({ guestId: user._id });              // bookings they made as a guest
    await Listing.deleteMany({ hostId: user._id });               // their listings
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
