// Test data script - Run this to populate demo data
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/clinic-care")
  .then(async () => {
    console.log("Connected to MongoDB");
    
    const User = require("./models/user");
    const Appointment = require("./models/appointment");
    const Prescription = require("./models/prescription");
    
    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    console.log("Cleared existing data");
    
    // Create test users
    const admin = new User({
      fullname: "Admin User",
      email: "admin@clinic.com",
      phone: "1234567890",
      password: "admin123",
      role: "admin"
    });
    await admin.save();
    
    const doctor = new User({
      fullname: "Dr. Smith",
      email: "smith@clinic.com",
      phone: "1234567891",
      password: "doctor123",
      role: "doctor"
    });
    await doctor.save();
    
    const patient = new User({
      fullname: "John Doe",
      email: "john@example.com",
      phone: "1234567892",
      password: "patient123",
      role: "patient"
    });
    await patient.save();
    
    const patient2 = new User({
      fullname: "Jane Smith",
      email: "jane@example.com",
      phone: "1234567893",
      password: "patient123",
      role: "patient"
    });
    await patient2.save();
    
    console.log("Created test users:");
    console.log("- Admin: admin@clinic.com / admin123");
    console.log("- Doctor: smith@clinic.com / doctor123");
    console.log("- Patient: john@example.com / patient123");
    
    // Create test appointments
    const appointment1 = new Appointment({
      patientName: "John Doe",
      patientEmail: "john@example.com",
      doctorName: "Dr. Smith",
      appointmentDate: new Date("2025-07-20"),
      appointmentTime: "10:00 AM",
      reason: "General Checkup",
      status: "scheduled"
    });
    await appointment1.save();
    
    const appointment2 = new Appointment({
      patientName: "Jane Smith",
      patientEmail: "jane@example.com",
      doctorName: "Dr. Smith",
      appointmentDate: new Date("2025-07-22"),
      appointmentTime: "02:00 PM",
      reason: "Follow-up",
      status: "scheduled"
    });
    await appointment2.save();
    
    console.log("Created test appointments");
    
    // Create test prescriptions
    const prescription1 = new Prescription({
      patientName: "John Doe",
      medication: "Vitamin C",
      dosage: "500mg daily",
      createdBy: "Dr. Smith",
      notes: "Take with food"
    });
    await prescription1.save();
    
    const prescription2 = new Prescription({
      patientName: "Jane Smith",
      medication: "Pain Relief",
      dosage: "200mg as needed",
      createdBy: "Dr. Smith",
      notes: "Maximum 3 times per day"
    });
    await prescription2.save();
    
    console.log("Created test prescriptions");
    console.log("\n✅ Test data loaded successfully!");
    console.log("\nYou can now login with:");
    console.log("  Admin: admin@clinic.com / admin123");
    console.log("  Doctor: smith@clinic.com / doctor123");
    console.log("  Patient: john@example.com / patient123");
    
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
