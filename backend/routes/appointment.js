const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment");
const User = require("../models/user");

// ➕ Book a new appointment
router.post("/book", async (req, res) => {
  try {
    const { patientName, patientEmail, doctorName, appointmentDate, appointmentTime, reason } = req.body;

    // Validate required fields
    if (!patientName || !patientEmail || !doctorName || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const appointment = new Appointment({
      patientName,
      patientEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      reason
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(400).json({
      message: "Failed to book appointment",
      error: err.message,
    });
  }
});

// 👨‍⚕️ List doctors (for booking dropdown)
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "fullname email _id"
    );
    res.json(
      doctors.map((d) => ({
        id: d._id,
        fullname: d.fullname,
        email: d.email,
      }))
    );
  } catch (err) {
    res.status(500).json({
      message: "Error fetching doctors",
      error: err.message,
    });
  }
});

// 📅 Appointments for a specific doctor (by full name)
router.get("/doctor/:doctorName", async (req, res) => {
  try {
    const raw = req.params.doctorName;
    const doctorName = decodeURIComponent(raw);
    const appointments = await Appointment.find({
      doctorName,
    }).sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving doctor appointments",
      error: err.message,
    });
  }
});

// 📅 Get appointments for a patient
router.get("/patient/:email", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientEmail: req.params.email,
    }).sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving appointments",
      error: err.message,
    });
  }
});

// 📅 Get all appointments (for admin/doctor)
router.get("/all", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving all appointments",
      error: err.message,
    });
  }
});

// ✏️ Update appointment status
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json({ message: "Appointment updated successfully", appointment });
  } catch (err) {
    res.status(500).json({
      message: "Error updating appointment",
      error: err.message,
    });
  }
});

// 🗑️ Cancel appointment
router.delete("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error cancelling appointment",
      error: err.message,
    });
  }
});

module.exports = router;