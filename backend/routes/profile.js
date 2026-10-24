const express  = require("express");
const router   = express.Router();
const path     = require("path");
const multer   = require("multer");
const Profile  = require("../models/Profile");
const protect  = require("../middleware/protect");

// ─── Default skill levels for well-known technologies ────────────────────────
const DEFAULT_LEVELS = {
  html: 95, html5: 95, css: 88, css3: 88,
  javascript: 85, js: 85, typescript: 70,
  react: 82, "node.js": 72, nodejs: 72,
  php: 70, python: 65, java: 60,
  mongodb: 68, mysql: 75, "c++": 55,
  "c#": 50, sql: 72, tailwind: 75, tailwindcss: 75,
  firebase: 60, express: 72, expressjs: 72,
};

function defaultLevel(name) {
  return DEFAULT_LEVELS[name.toLowerCase()] ?? 70;
}

// ─── Multer — images (photo) ──────────────────────────────────────────────────
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${Date.now()}${ext}`);
  },
});
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
            && /image\//.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed."));
  },
});

// ─── Multer — CV (PDF) ────────────────────────────────────────────────────────
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `cv-${Date.now()}${ext}`);
  },
});
const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },   // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = path.extname(file.originalname).toLowerCase() === ".pdf"
            && file.mimetype === "application/pdf";
    ok ? cb(null, true) : cb(new Error("Only PDF files are allowed."));
  },
});

// ─── Migration helper ─────────────────────────────────────────────────────────
// Converts old plain-string skills to [{name, level}] objects and seeds missing fields.
async function migrateProfile(profileId) {
  const doc = await Profile.findById(profileId).lean();
  if (!doc) return;

  const updates = {};

  // skills: if it's an array of strings, convert to [{name, level}]
  if (Array.isArray(doc.skills) && doc.skills.length > 0 && typeof doc.skills[0] === "string") {
    updates.skills = doc.skills.map((name) => ({ name, level: defaultLevel(name) }));
  }

  if (!Array.isArray(doc.extraSocials)) updates.extraSocials = [];
  if (!doc.photo)      updates.photo      = "";
  if (!doc.cv)         updates.cv         = "";
  if (!doc.heroTitles || doc.heroTitles.length === 0) {
    updates.heroTitles = ["Full Stack Developer","React Developer","Node.js Developer","UI/UX Enthusiast"];
  }

  if (Object.keys(updates).length > 0) {
    await Profile.updateOne({ _id: profileId }, { $set: updates });
  }
}

// ─── GET /api/profile  (public) ───────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    let profile = await Profile.findOne();

    if (!profile) {
      profile = await Profile.create({
        name: "Mekuanint Misganaw", title: "Full Stack Developer",
        bio:  "I am a dedicated third-year Information Systems student at Bahir Dar University with a strong passion for web development and modern technology.",
        email: "mismarkol903@gmail.com", location: "Bahir Dar, Ethiopia",
        github: "https://github.com/mismark", linkedin: "https://linkedin.com",
        telegram: "https://t.me/mismarkol", instagram: "https://instagram.com/mismarkol2121",
        skills: [
          { name: "HTML",       level: 95 }, { name: "CSS",        level: 88 },
          { name: "JavaScript", level: 85 }, { name: "React",      level: 82 },
          { name: "Node.js",    level: 72 }, { name: "PHP",        level: 70 },
          { name: "MySQL",      level: 75 }, { name: "Python",     level: 65 },
          { name: "Java",       level: 60 }, { name: "C++",        level: 55 },
          { name: "C#",         level: 50 }, { name: "MongoDB",    level: 68 },
        ],
        heroTitles: ["Full Stack Developer","React Developer","Node.js Developer","UI/UX Enthusiast"],
        extraSocials: [], photo: "", cv: "",
        stats: { yearsExperience: 1, projectsCompleted: 5, skillsCount: 12 },
      });
    } else {
      await migrateProfile(profile._id);
      profile = await Profile.findById(profile._id);
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Profile GET:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PUT /api/profile  (admin) ────────────────────────────────────────────────
router.put("/", protect, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    const body  = { ...req.body };

    // Parse JSON strings (may come from form submissions)
    ["extraSocials", "skills", "heroTitles"].forEach((key) => {
      if (typeof body[key] === "string") {
        try { body[key] = JSON.parse(body[key]); } catch { body[key] = []; }
      }
    });

    // Normalise extraSocials
    if (!Array.isArray(body.extraSocials)) body.extraSocials = [];
    body.extraSocials = body.extraSocials.filter((s) => s?.platform && s?.url);

    // Normalise skills — accept both [{name,level}] and plain strings
    if (Array.isArray(body.skills)) {
      body.skills = body.skills
        .map((s) => {
          if (typeof s === "string") return { name: s, level: defaultLevel(s) };
          if (s?.name) return { name: s.name, level: Number(s.level) || defaultLevel(s.name) };
          return null;
        })
        .filter(Boolean);
    }

    // Normalise heroTitles
    if (!Array.isArray(body.heroTitles) || body.heroTitles.length === 0) {
      delete body.heroTitles; // keep existing
    } else {
      body.heroTitles = body.heroTitles.filter(Boolean);
    }

    if (!profile) {
      profile = await Profile.create(body);
    } else {
      profile = await Profile.findByIdAndUpdate(
        profile._id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    console.error("Profile PUT:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── POST /api/profile/photo  (admin) ─────────────────────────────────────────
router.post("/photo", protect, uploadImage.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const photoUrl = `/uploads/${req.file.filename}`;
    const profile  = await Profile.findOneAndUpdate(
      {}, { $set: { photo: photoUrl } }, { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found." });
    res.json({ success: true, photo: photoUrl, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Upload failed." });
  }
});

// ─── POST /api/profile/cv  (admin) ────────────────────────────────────────────
router.post("/cv", protect, uploadCV.single("cv"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });
    const cvUrl   = `/uploads/${req.file.filename}`;
    const profile = await Profile.findOneAndUpdate(
      {}, { $set: { cv: cvUrl } }, { new: true }
    );
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found." });
    res.json({ success: true, cv: cvUrl, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "CV upload failed." });
  }
});

module.exports = router;
