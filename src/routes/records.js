const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");

// GET all records
router.get("/", async (req, res) => {
  try {
    const records = await MedicalRecord.find();
    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET records by patientId
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
    console.log("Received record data:", req.body);

    if (!req.body) {
      return res.status(400).json({ error: "Request body is empty" });
    }

    // Create new medical record
    const record = new MedicalRecord({
      fileName: req.body.fileName || "Untitled",
      recordType: req.body.recordType || "other",
      doctorName: req.body.doctorName || "Unknown",
      date: req.body.date || new Date(),
      description: req.body.description || "",
      fileSize: req.body.fileSize || 0,
      patientId: req.body.patientId || "default_id",
    });

    // Save to database
    const savedRecord = await record.save();
    console.log("Record saved successfully:", savedRecord);

    res.status(201).json(savedRecord);
  } catch (error) {
    console.error("Error saving record:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
