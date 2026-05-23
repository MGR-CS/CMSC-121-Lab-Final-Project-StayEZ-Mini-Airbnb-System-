const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const Booking = require("../models/Booking"); // required for the deleting related boookings
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

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if(location) {
      query.location = { $regex: location, $options: "i" };
    }

    if(type) {
      query.type = type;
    }

    let sortObj = {};
    if (sort === "price_asc") {
      sortObj = { price: 1 };  // Lowest to highest 📈
    } else if (sort === "price_desc") {
      sortObj = { price: -1 }; // Highest to lowest 📉
    }

    const listings = await Listing.find(query)
        .sort(sortObj)
        .populate("hostId", "name");

    // TODO: If `search` is provided, filter by name (case-insensitive)
    // e.g., query.name = { $regex: search, $options: "i" };

    // TODO: If `location` is provided, filter by location (case-insensitive)

    // TODO: If `type` is provided, filter by type (exact or case-insensitive)

    // TODO: Build sort object
    // price_asc  → { price: 1 }
    // price_desc → { price: -1 }

    // TODO: Execute query with Listing.find(query).sort(sortObj)
    // TODO: Populate hostId with host name (but NOT contactNumber — that's restricted)

    res.status(200).json(listings);
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
    const { name, type, location, price, description, image, contactNumber } = req.body;
    const hostId = req.user._id;
      if(!name || !type || !location || !price || !contactNumber) {
        return res.status(400).json({ message: "Please enter all required fields" });
      }

      const list = await Listing.create( {
        name: name,
        type: type,
        location: location,
        price: price,
        description: description,
        image: image,
        hostId: hostId,
        contactNumber: contactNumber,
      })

    res.status(201).json(list);
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
      const id = req.params.id;
      const listing = await Listing.findById(id)
      const isOwner = req.user._id.toString() === listing.hostId.toString();
      const isAdmin = req.user.role === "admin";

      if(!listing) {
        res.status(404).json({message: "No list found"});
      }

      if(!isOwner && !isAdmin) {
        res.status(403).json({message: "Action not permitted"})
      }

      await Booking.deleteMany({listingId: id});
      await Listing.deleteOne({ _id: id })

      // TODO: Also delete related bookings? (optional, discuss with team)
        // Chris: Implementation is done. Haven't discussed with team yet so

      res.status(200).json({ message: "Listing and related booking deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
