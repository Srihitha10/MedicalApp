// src/routes/users.js - Updated version
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Health check
router.get("/", (req, res) => {
  res.json({ message: "Users route working" });
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    console.log("Received user data:", req.body); // Add logging

    const { name, email, walletAddress, role } = req.body;

    const user = new User({
      name,
      email,
      walletAddress,
      role, // optional – will default to 'patient' if not given
    });

    await user.save();
    console.log("User saved:", user); // Add logging
    res.status(201).json(user);
  } catch (error) {
    console.error("Error saving user:", error); // Add logging
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
