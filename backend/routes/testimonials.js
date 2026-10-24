const express     = require("express");
const router      = express.Router();
const Testimonial = require("../models/Testimonial");
const protect     = require("../middleware/protect");

router.get("/", async (req, res) => {
  try {
    const items = await Testimonial.find().sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const item = await Testimonial.create(req.body);
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
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
