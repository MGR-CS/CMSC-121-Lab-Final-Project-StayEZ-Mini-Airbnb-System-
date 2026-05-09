const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const { protect, authorize } = require("../middleware/auth");

/**
 * @route   GET /api/listings
 * @desc    Get all listings with optional search, filter, and sort
 * @access  Public (anyone can browse)
 * @query   search=<name>  location=<loc>  type=<type>  sort=price_asc|price_desc
 * @example /api/listings?search=room&location=manila&type=apartment&sort=price_asc
 */
router.get("/", async (req, res) => {
  try {
    const { search, location, type, sort } = req.query;
    let query = {};

    // TODO: If `search` is provided, filter by name (case-insensitive)
    // e.g., query.name = { $regex: search, $options: "i" };

    // TODO: If `location` is provided, filter by location (case-insensitive)

    // TODO: If `type` is provided, filter by type (exact or case-insensitive)

    // TODO: Build sort object
    // price_asc  → { price: 1 }
    // price_desc → { price: -1 }

    // TODO: Execute query with Listing.find(query).sort(sortObj)
    // TODO: Populate hostId with host name (but NOT contactNumber — that's restricted)

    res.status(200).json({ message: "TODO: return listings" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/listings/:id
 * @desc    Get a single listing by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    // TODO: Find listing by req.params.id
    // TODO: Return 404 if not found

    res.status(200).json({ message: "TODO: return single listing" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/listings
 * @desc    Create a new listing
 * @access  Private - Host only
 */
router.post("/", protect, authorize("host", "admin"), async (req, res) => {
  try {
    const { name, type, location, price, description, image, contactNumber } =
      req.body;

    // TODO: Validate required fields
    // TODO: Create listing with hostId = req.user._id
    // TODO: Return the created listing

    res.status(201).json({ message: "TODO: create listing" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/listings/:id
 * @desc    Update a listing
 * @access  Private - Owner host or admin
 */
router.put("/:id", protect, authorize("host", "admin"), async (req, res) => {
  try {
    // TODO: Find listing by ID
    // TODO: Check that req.user._id === listing.hostId OR req.user.role === "admin"
    // TODO: Update and return the listing

    res.status(200).json({ message: "TODO: update listing" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/listings/:id
 * @desc    Delete a listing
 * @access  Private - Owner host or admin
 */
router.delete(
  "/:id",
  protect,
  authorize("host", "admin"),
  async (req, res) => {
    try {
      // TODO: Find listing by ID
      // TODO: Check ownership (host) or admin role
      // TODO: Delete listing
      // TODO: Also delete related bookings? (optional, discuss with team)

      res.status(200).json({ message: "TODO: delete listing" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
