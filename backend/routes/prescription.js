const express = require("express");
const router = express.Router();
const Prescription = require("../models/prescription");

// ➕ Add a prescription
router.post("/add", async (req, res) => {
  try {
    const { patientName, medication, dosage, createdBy } = req.body;

    if (!patientName || !medication || !dosage || !createdBy) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const prescription = new Prescription({
      patientName,
      medication,
      dosage,
      createdBy,
    });

    await prescription.save();
    res.status(201).json({ message: "Prescription saved", prescription });
  } catch (err) {
    res.status(400).json({
      message: "Failed to save prescription",
      error: err.message,
    });
  }
});

// 📥 Get all prescriptions (admin/doctor dashboards) — MUST be before /:patientName
router.get("/all", async (req, res) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving all prescriptions",
      error: err.message,
    });
  }
});

// 📥 Prescriptions written by a doctor (createdBy = doctor full name)
router.get("/doctor/:createdBy", async (req, res) => {
  try {
    const createdBy = decodeURIComponent(req.params.createdBy);
    const prescriptions = await Prescription.find({ createdBy }).sort({
      createdAt: -1,
    });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving prescriptions by doctor",
      error: err.message,
    });
  }
});

// 📥 Get prescriptions for a patient (by name)
router.get("/:patientName", async (req, res) => {
  try {
    const patientName = decodeURIComponent(req.params.patientName);
    const prescriptions = await Prescription.find({
      patientName,
    }).sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving prescriptions",
      error: err.message,
    });
  }
});

// 🗑️ Delete a prescription
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findByIdAndDelete(id);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({ message: "Prescription deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting prescription",
      error: err.message,
    });
  }
});

// ✏️ Update a prescription
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { medication, dosage } = req.body;

    if (!medication || !dosage) {
      return res
        .status(400)
        .json({ message: "Medication and dosage are required" });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { medication, dosage },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({ message: "Prescription updated successfully", prescription });
  } catch (err) {
    res.status(500).json({
      message: "Error updating prescription",
      error: err.message,
    });
  }
});

module.exports = router;
