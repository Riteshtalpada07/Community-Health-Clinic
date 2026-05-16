const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, "Patient name is required"],
    trim: true
  },
  medication: {
    type: String,
    required: [true, "Medication is required"],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, "Dosage is required"],
    trim: true
  },
  createdBy: {
    type: String,
    required: [true, "Created by field is required"],
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Prescription", prescriptionSchema);
