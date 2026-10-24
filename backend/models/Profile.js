const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    url:      { type: String, required: true, trim: true },
    icon:     { type: String, default: "", trim: true },
  },
  { _id: true }
);

// Each skill stores its name and the admin-set proficiency level (0–100)
const skillSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    level: { type: Number, default: 70, min: 0, max: 100 },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    title:    { type: String, required: true, trim: true },
    bio:      { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true, lowercase: true },
    phone:    { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },

    photo:    { type: String, trim: true, default: "" },

    // CV file — stored as /uploads/<filename>
    cv:       { type: String, trim: true, default: "" },

    github:    { type: String, trim: true, default: "" },
    linkedin:  { type: String, trim: true, default: "" },
    telegram:  { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },

    extraSocials: { type: [socialSchema], default: [] },

    // Skills with per-skill proficiency levels
    skills: { type: [skillSchema], default: [] },

    // Typewriter titles for the Hero section
    heroTitles: {
      type: [String],
      default: ["Full Stack Developer", "React Developer", "Node.js Developer", "UI/UX Enthusiast"],
    },

    stats: {
      yearsExperience:   { type: Number, default: 1 },
      projectsCompleted: { type: Number, default: 5 },
      skillsCount:       { type: Number, default: 9 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
