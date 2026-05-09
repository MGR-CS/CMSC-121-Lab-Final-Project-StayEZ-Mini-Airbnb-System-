require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// --- Route imports ---
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const bookingRoutes = require("./routes/bookings");

// --- Connect to MongoDB ---
connectDB();

const app = express();

// --- Middleware ---
app.use(cors()); // TODO: Restrict CORS origin in production
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, "../public")));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);

// --- Admin user routes ---
// TODO: Create server/routes/users.js for admin to manage users
// app.use("/api/users", userRoutes);

// --- Catch-all: serve frontend for any non-API route ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StayEZ server running on http://localhost:${PORT}`);
});
