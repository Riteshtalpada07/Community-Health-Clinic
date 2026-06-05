const User = require("../models/user");

async function seedAdminIfNeeded() {
  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount > 0) {
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "No admin account found and ADMIN_EMAIL/ADMIN_PASSWORD are not set — skipping admin seed."
    );
    return;
  }

  const admin = new User({
    fullname: process.env.ADMIN_FULLNAME || "System Admin",
    email: email.trim().toLowerCase(),
    phone: process.env.ADMIN_PHONE || "",
    password,
    role: "admin",
  });

  await admin.save();
  console.log(`Admin account seeded successfully (${email})`);
}

module.exports = seedAdminIfNeeded;
