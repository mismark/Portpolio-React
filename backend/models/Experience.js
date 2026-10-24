const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    type:        { type: String, enum: ["work", "education"], default: "work" },
    title:       { type: String, required: true, trim: true },   // e.g. "Full Stack Developer"
    organization:{ type: String, required: true, trim: true },   // e.g. "Bahir Dar University"
    location:    { type: String, trim: true, default: "" },
    startDate:   { type: String, required: true, trim: true },   // e.g. "Sep 2022"
    endDate:     { type: String, trim: true, default: "Present" },
    current:     { type: Boolean, default: false },
    description: { type: String, trim: true, default: "" },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);
