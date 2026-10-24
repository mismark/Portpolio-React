const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    issuer:       { type: String, required: true, trim: true },   // e.g. "Coursera"
    date:         { type: String, trim: true, default: "" },      // e.g. "Jan 2024"
    credentialUrl:{ type: String, trim: true, default: "" },
    image:        { type: String, trim: true, default: "" },      // badge image /uploads/...
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
