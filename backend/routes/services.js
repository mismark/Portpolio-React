const express = require("express");
const router  = express.Router();
const Service = require("../models/Service");
const protect = require("../middleware/protect");

router.get("/", async (req, res) => {
  try {
    const items = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.features === "string") {
      body.features = body.features.split("\n").map((f) => f.trim()).filter(Boolean);
    }
    const item = await Service.create(body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(err.errors)[0].message });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.features === "string") {
      body.features = body.features.split("\n").map((f) => f.trim()).filter(Boolean);
    }
    const item = await Service.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
