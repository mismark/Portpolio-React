const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const fs      = require("fs");
const path    = require("path");
const protect = require("../middleware/protect");

// ─── POST /api/auth/login  (public) ──────────────────────────────────────────
router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required." });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ success: false, message: "Server misconfiguration." });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Invalid password." });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.json({ success: true, token });
});

// ─── PUT /api/auth/password  (admin) ─────────────────────────────────────────
router.put("/password", protect, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Both current and new password are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
  }

  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Current password is incorrect." });
  }

  // Update in-process immediately
  process.env.ADMIN_PASSWORD = newPassword;

  // Persist to .env so it survives restart
  try {
    const envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf8");
      content = content.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${newPassword}`);
      fs.writeFileSync(envPath, content, "utf8");
    }
  } catch (e) {
    console.warn("Could not write .env:", e.message);
    // Non-fatal — password still works for this session
  }

  res.json({ success: true, message: "Password updated successfully." });
});

module.exports = router;
