const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Helper: Generate a signed JWT for a given user ID
 * TODO: Set a sensible expiry (e.g., "7d")
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // TODO: Validate that required fields are provided
    // TODO: Check if a user with the same email already exists
    // TODO: Hash password before saving (already handled in User model pre-save hook)
    // TODO: Create the user and return a JWT token

    res.status(201).json({ message: "TODO: register user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // TODO: Find user by email
    // TODO: Compare password using user.matchPassword()
    // TODO: Return JWT token and user info (name, role) on success
    // TODO: Return 401 if credentials are invalid

    res.status(200).json({ message: "TODO: login user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
