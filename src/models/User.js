const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  patientId: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{4,}$/,
  },
  role: {
    type: String,
    enum: ["user", "admin", "doctor"],
    default: "user",
  },
  // Doctor-specific fields
  hospitalName: {
    type: String,
    required: false,
  },
  doctorID: {
    type: String,
    required: false,
  },
  doctorPublicId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    match: /^D\d{4,}$/,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
