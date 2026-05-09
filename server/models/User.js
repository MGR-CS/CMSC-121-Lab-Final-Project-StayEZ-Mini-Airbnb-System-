const mongoose = require("mongoose");

/**
 * User Schema
 * Roles: "guest", "host", "admin"
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      // TODO: Hash password using bcryptjs before saving (use pre-save hook)
    },
    role: {
      type: String,
      enum: ["guest", "host", "admin"],
      default: "guest",
    },
  },
  { timestamps: true }
);

// TODO: Add pre-save hook to hash password with bcryptjs
// userSchema.pre("save", async function (next) { ... });

// TODO: Add method to compare plaintext password with hashed password
// userSchema.methods.matchPassword = async function (enteredPassword) { ... };

module.exports = mongoose.model("User", userSchema);
