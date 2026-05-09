const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the URI from environment variables.
 * Call this once at server startup.
 */
const connectDB = async () => {
  try {
    // TODO: Ensure MONGO_URI is set in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
