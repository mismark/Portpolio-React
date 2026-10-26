const express = require("express");
const path    = require("path");
const multer  = require("multer");
const Project = require("../models/Project");
const protect = require("../middleware/protect");

// ─── Multer — project images ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `project-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
            && /image\//.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed."));
  },
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

const getAll = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("Projects getAll error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getOne = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const create = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0] });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const update = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const remove = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    res.json({ success: true, message: "Project deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── POST /api/projects/:id/image  (admin) ────────────────────────────────────
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const imageUrl = `/uploads/${req.file.filename}`;
    const project  = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { image: imageUrl } },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.json({ success: true, image: imageUrl, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Upload failed." });
  }
};

// ─── Router (used in server.js for the image upload route) ───────────────────
const router = express.Router();
router.post("/:id/image", protect, upload.single("image"), uploadImage);

module.exports = { getAll, getOne, create, update, remove, router };
