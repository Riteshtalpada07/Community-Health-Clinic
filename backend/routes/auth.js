const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const {
  authenticateToken,
  requireRole,
  getJwtSecret,
} = require("../middleware/auth");

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

function userNoPassword(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  return user;
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, phone, password, role } = req.body;

    if (!fullname || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "admin") {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) {
        return res
          .status(403)
          .json({ message: "Admin registration requires authentication" });
      }
      try {
        const decoded = jwt.verify(token, getJwtSecret());
        const adminUser = await User.findById(decoded.userId);
        if (!adminUser || adminUser.role !== "admin") {
          return res
            .status(403)
            .json({ message: "Only admins can create admin accounts" });
        }
      } catch {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
    }

    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email and role" });
    }

    const user = new User({ fullname, email, phone, password, role });
    await user.save();

    const tokenOut = signToken(user);
    res.status(201).json({
      message: "User registered",
      token: tokenOut,
      user: userNoPassword(user),
    });
  } catch (err) {
    res.status(400).json({ message: "Registration failed", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password, and role are required" });
  }

  try {
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({
      message: "Login successful",
      token,
      user: userNoPassword(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Get all users (for admin)
router.get(
  "/users",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const users = await User.find({}, { password: 0 });
      res.json(users);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching users", error: err.message });
    }
  }
);

// Get user by id (self or admin)
router.get("/users/id/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.userId === id;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(id, { password: 0 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: err.message });
  }
});

// Get users by role (admin: any role; doctor: only patient list)
router.get("/users/role/:role", authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    if (req.user.role === "admin") {
      const users = await User.find({ role }, { password: 0 });
      return res.json(users);
    }

    if (role === "patient" && req.user.role === "doctor") {
      const users = await User.find({ role: "patient" }, { password: 0 });
      return res.json(users);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// Update user (admin or self only)
router.put("/users/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "admin";
    const isSelf = req.user.userId === id;
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Access denied" });
    }

    const allowedFields = ["fullname", "email", "phone", "role"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (!isAdmin && updates.role !== undefined) {
      delete updates.role;
    }

    if (updates.role && !["patient", "doctor", "admin"].includes(updates.role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
});

// Delete user (for admin)
router.delete(
  "/users/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting user", error: err.message });
    }
  }
);

module.exports = router;
