const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

module.exports = router;