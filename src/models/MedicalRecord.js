const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  ipfsHash: {
    type: String,
    default: function () {
      // Generate a unique placeholder hash based on timestamp and random string
      return `ipfs_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
    },
  },
  fileName: {
    type: String,
    required: true,
  },
  recordType: {
    type: String,
    required: true,
  },
  doctorName: String,
  description: String,
  date: {
    type: Date,
    default: Date.now,
  },
  fileSize: Number,
  patientId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
