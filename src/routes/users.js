const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all users
router.get("/", async (req, res) => {
  try {
    console.log("📋 Getting all users...");
    const users = await User.find().select("-password");
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    console.log(
      "📝 Creating user with data:",
      JSON.stringify(req.body, null, 2)
    );

    if (!req.body) {
      console.error("❌ Request body is missing");
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { name, email, password } = req.body;

    // Check for required fields
    if (!name) {
      console.error("❌ Username is required");
      return res.status(400).json({ error: "Username is required" });
    }

    if (!email) {
      console.error("❌ Email is required");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!password) {
      console.error("❌ Password is required");
      return res.status(400).json({ error: "Password is required" });
    }

    console.log("🔍 Checking if user already exists...");

    // Check if user already exists by name or email
    const existingUserByName = await User.findOne({ name });
    if (existingUserByName) {
      console.error("❌ Username already exists");
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.error("❌ Email already registered");
      return res.status(400).json({ error: "Email already registered" });
    }

    console.log("✅ Validation passed, creating new user...");

    // Create new user with the required fields
    const newUser = new User({
      name,
      email,
      password,
    });

    // Save user to database
    console.log("💾 Saving user to database...");
    const savedUser = await newUser.save();
    console.log("✅ User created successfully:", savedUser._id);

    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error code:", error.code);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
