// src/routes/records.js - Keep most of your code but remove the duplicate route
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

// REMOVE THIS FIRST POST HANDLER - This is causing the issue
// router.post("/", (req, res) => {
//   try {
//     const recordData = req.body;
//     res.status(201).json(recordData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Keep only this POST handler
router.post("/", async (req, res) => {
  try {
    console.log("Received record data:", req.body); // Add this logging line
    const record = new MedicalRecord(req.body);
    await record.save();
    console.log("Record saved successfully:", record); // Add this logging line
    res.status(201).json(record);
  } catch (error) {
    console.error("Error saving record:", error); // Add this logging line
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
