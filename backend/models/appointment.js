const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "Patient name is required"],
    trim: true
  },
  patientEmail: {
    type: String,
    required: [true, "Patient email is required"],
    trim: true,
    lowercase: true
  },
  doctorName: {
    type: String,
    required: [true, "Doctor name is required"],
    trim: true
  },
  appointmentDate: {
    type: Date,
    required: [true, "Appointment date is required"]
  },
  appointmentTime: {
    type: String,
    required: [true, "Appointment time is required"],
    trim: true
  },
  reason: {
    type: String,
    required: [true, "Reason for visit is required"],
    trim: true
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled", "rescheduled"],
    default: "scheduled"
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

appointmentSchema.index({ patientEmail: 1 });
appointmentSchema.index({ doctorName: 1 });
appointmentSchema.index({ appointmentDate: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);