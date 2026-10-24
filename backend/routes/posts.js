const express = require("express");
const router  = express.Router();
const path    = require("path");
const multer  = require("multer");
const Post    = require("../models/Post");
const protect = require("../middleware/protect");

// ─── Multer for cover images ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `post-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Images only."));
  },
});

// ─── GET /api/posts  — public (only published posts) ─────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = { published: true };
    if (req.query.tag) filter.tags = req.query.tag;

    const posts = await Post.find(filter)
      .select("-content")   // don't send full content in list
      .sort({ createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/posts/all  — admin (all posts including drafts) ─────────────
router.get("/all", protect, async (req, res) => {
  try {
    const posts = await Post.find().select("-content").sort({ createdAt: -1 });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET /api/posts/:slug  — public single post ───────────────────────────
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── POST /api/posts  — admin ─────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    const post = await Post.create(body);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: Object.values(err.errors)[0].message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "A post with this slug already exists." });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PUT /api/posts/:id  — admin ──────────────────────────────────────────
router.put("/:id", protect, async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    const post = await Post.findByIdAndUpdate(req.params.id, body, {
      new: true, runValidators: true,
    });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── DELETE /api/posts/:id  — admin ──────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    res.json({ success: true, message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── POST /api/posts/:id/cover  — admin upload cover image ───────────────
router.post("/:id/cover", protect, upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const coverUrl = `/uploads/${req.file.filename}`;
    const post = await Post.findByIdAndUpdate(req.params.id, { coverImage: coverUrl }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });
    res.json({ success: true, coverImage: coverUrl, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
