const express    = require("express");
const router     = express.Router();
const Experience = require("../models/Experience");
const protect    = require("../middleware/protect");

// GET /api/experience  — public
router.get("/", async (req, res) => {
  try {
    const items = await Experience.find().sort({ order: 1, startDate: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/experience  — admin
router.post("/", protect, async (req, res) => {
  try {
    const item = await Experience.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// PUT /api/experience/:id  — admin
router.put("/:id", protect, async (req, res) => {
  try {
    const item = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE /api/experience/:id  — admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Experience.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
