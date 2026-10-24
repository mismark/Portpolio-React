const express     = require("express");
const router      = express.Router();
const path        = require("path");
const multer      = require("multer");
const Certificate = require("../models/Certificate");
const protect     = require("../middleware/protect");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cert-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Images only."));
  },
});

router.get("/", async (req, res) => {
  try {
    const items = await Certificate.find().sort({ order: 1, date: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const item = await Certificate.create(req.body);
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
    const item = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Certificate.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/certificates/:id/image  — upload badge image
router.post("/:id/image", protect, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file." });
    const imageUrl = `/uploads/${req.file.filename}`;
    const item = await Certificate.findByIdAndUpdate(req.params.id, { image: imageUrl }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, image: imageUrl, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
