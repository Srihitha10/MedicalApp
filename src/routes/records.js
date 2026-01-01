const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");

// GET all records or filter by userId
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    let records;
    if (userId) {
      // Filter by specific user ID
      records = await MedicalRecord.find({ patientId: userId });
    } else {
      // Return all records (for admin)
      records = await MedicalRecord.find();
    }

    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET records by patientId (legacy endpoint)
router.get("/:patientId", async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patientId: req.params.patientId,
    });
    res.json(records);
  } catch (error) {
    console.error("Error fetching patient records:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST new record
router.post("/", async (req, res) => {
  try {
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    if (!req.body) {
      return res.status(400).json({ error: "Request body is empty" });
    }

    const ipfsHash = req.body.ipfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // Create new medical record
    const record = new MedicalRecord({
      fileName: req.body.fileName || "Untitled",
      recordType: req.body.recordType || "other",
      doctorName: req.body.doctorName || "Unknown",
      date: req.body.uploadDate || new Date(),
      description: req.body.description || "",
      fileSize: req.body.fileSize || 0,
      patientId: req.body.patientId || "default_id",
      ipfsHash: ipfsHash,
      ipfsUrl: ipfsUrl,
      watermarkHash: req.body.watermarkHash || null,
      timestamp: req.body.timestamp, // Store the EXACT timestamp used for watermarking
    });

    const savedRecord = await record.save();
    console.log("Record saved successfully:", savedRecord);

    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error saving record:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
