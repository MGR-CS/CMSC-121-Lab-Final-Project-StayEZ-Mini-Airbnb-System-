require("dotenv").config({ path: require('path').resolve('./.env') });

console.log("Current Working Directory:", process.cwd());
console.log("Database URI from env:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// --- Route imports ---
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const bookingRoutes = require("./routes/bookings");
const adminRoutes = require("./routes/admin");
const favoritesRoutes = require("./routes/favorites");
const ratingsRoutes = require("./routes/ratings");

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
app.use("/api/admin", adminRoutes);
app.use("/api/favorites", favoritesRoutes)
app.use("/api/ratings", ratingsRoutes)

// --- Admin user routes (now handled by /api/admin) ---

// --- Catch-all: serve frontend for any non-API route ---
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StayEZ server running on http://localhost:${PORT}`);
});
