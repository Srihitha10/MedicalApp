const express = require("express");
const router = express.Router();
const MedicalRecord = require("../models/MedicalRecord");

router.get("/", (req, res) => {
  res.json({ message: "Records route working" });
});

// Get all records for a patient
router.get("/:patientId", async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      patientId: req.params.patientId,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const recordData = req.body;
    res.status(201).json(recordData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload new record
router.post("/", async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
