const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon:        { type: String, trim: true, default: "FaCode" }, // react-icons name
    features:    { type: [String], default: [] },
    price:       { type: String, trim: true, default: "" },       // e.g. "From $50" or ""
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
