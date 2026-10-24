const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    role:     { type: String, trim: true, default: "" },       // e.g. "Professor, BDU"
    message:  { type: String, required: true, trim: true },
    avatar:   { type: String, trim: true, default: "" },       // /uploads/... or initials fallback
    rating:   { type: Number, default: 5, min: 1, max: 5 },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
