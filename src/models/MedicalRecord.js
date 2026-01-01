const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  // IPFS related fields (required for blockchain integration)
  ipfsHash: {
    type: String,
    required: true,
    unique: true,
  },
  ipfsUrl: {
    type: String,
    required: true,
  },

  // Core fields you specifically need
  fileName: {
    type: String,
    required: true,
  },
  recordType: {
    type: String,
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  description: String,

  // File metadata (needed for display and verification)
  fileSize: Number,

  // Required for associating records with patients
  patientId: {
    type: String,
    required: true,
  },

  // Timestamps
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  watermarkHash: {
    type: String,
    required: true,
  },

  // CRITICAL: Store the EXACT timestamp used for watermarking
  timestamp: {
    type: String, // Store as string to preserve exact format
    required: true,
  },

  tampered: {
    type: Boolean,
    default: false,
  },
  originalIpfsHash: String,
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
