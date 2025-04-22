const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  ipfsHash: {
    type: String,
    required: true,
    unique: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  recordType: {
    type: String,
    required: true,
    enum: [
      "lab-result",
      "prescription",
      "imaging",
      "clinical-notes",
      "discharge-summary",
      "vaccination",
      "other",
    ],
  },
  doctorName: String,
  date: Date,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
