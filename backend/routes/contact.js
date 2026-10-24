const express = require("express");
const router  = express.Router();
const Contact = require("../models/Contact");
const protect = require("../middleware/protect");

// ─── POST /api/contact  (public) ─────────────────────────────────────────────
// Anyone can send a message from the portfolio contact form.
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const contact = await Contact.create({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: "Message received! I'll get back to you soon.",
      data: contact,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0] });
    }
    console.error("Contact POST error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// ─── GET /api/contact  (admin only) ──────────────────────────────────────────
// Returns all messages sorted newest first.
router.get("/", protect, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error("Contact GET error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PATCH /api/contact/:id/read  (admin only) ───────────────────────────────
// Toggles the read flag on a single message.
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    // If caller sends { read: true/false } use that; otherwise toggle
    const newRead =
      typeof req.body.read === "boolean" ? req.body.read : !message.read;

    message.read = newRead;
    await message.save();

    res.json({ success: true, data: message });
  } catch (err) {
    console.error("Contact PATCH read error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── DELETE /api/contact/:id  (admin only) ───────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }
    res.json({ success: true, message: "Message deleted." });
  } catch (err) {
    console.error("Contact DELETE error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
