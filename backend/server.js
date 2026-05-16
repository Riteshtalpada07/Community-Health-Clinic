require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const prescriptionRoutes = require("./routes/prescription");
const appointmentRoutes = require("./routes/appointment");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/clinic-care";

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("!!!Connected to MongoDB!!!");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

app.use("/api/auth", authRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Community Health Clinic API is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      prescriptions: "/api/prescriptions",
      appointments: "/api/appointments",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
