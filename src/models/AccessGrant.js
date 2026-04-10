const mongoose = require("mongoose");

const accessGrantSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    granteeId: {
      type: String,
      required: true,
      index: true,
    },
    granteePatientId: {
      type: String,
      required: true,
      index: true,
      match: /^\d{4,}$/,
    },
    granteeDoctorPublicId: {
      type: String,
      required: false,
      index: true,
      match: /^D\d{4,}$/,
    },
    granteeName: {
      type: String,
      required: true,
    },
    granteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      enum: ["family", "friend", "doctor", "caregiver", "specialist", "other"],
    },
    accessType: {
      type: String,
      enum: ["normal"],
      default: "normal",
    },
    allowedRecordTypes: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

accessGrantSchema.index({ patientId: 1, granteePatientId: 1, status: 1 });

module.exports = mongoose.model("AccessGrant", accessGrantSchema);
