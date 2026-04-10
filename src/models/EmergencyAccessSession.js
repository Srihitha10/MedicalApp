const mongoose = require("mongoose");

const emergencyAccessSessionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    doctorName: {
      type: String,
      default: "Doctor",
      trim: true,
    },
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 1,
      max: 2,
      default: 2,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "ended", "expired"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "EmergencyAccessSession",
  emergencyAccessSessionSchema,
);
