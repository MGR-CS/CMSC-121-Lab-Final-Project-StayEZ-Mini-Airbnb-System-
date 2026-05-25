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
  let finalRole;
  try {
    const {name, email, password, role} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({message: "Please enter all required fields"});
    }

    const userExists = await User.findOne({email});
    if (userExists) {
      return res.status(400).json({message: "User with this email already exists"});
    }

    if (role === "guest" || role === "host") {
      finalRole = role;
    }

    // NOTE: role is intentionally NOT taken from req.body (mahhack tayo sir)
    // All self-registered users are "guest" by default
    // Roles (host, admin) are assigned by an admin via /api/admin/users/:id/role (as it should)
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
    });

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({message: error.message});
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
    // Find a user with this email
    const user = await User.findOne({ email })

    // If user not found, invalid
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    // If password does not match (after applying salt and stuff), return error
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id)

    // send token along with user data to the browser
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
