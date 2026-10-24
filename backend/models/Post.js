const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, required: true, trim: true, unique: true, lowercase: true },
    excerpt:   { type: String, required: true, trim: true, maxlength: 300 },
    content:   { type: String, required: true },          // Markdown / plain text
    coverImage:{ type: String, trim: true, default: "" }, // /uploads/...
    tags:      { type: [String], default: [] },
    published: { type: Boolean, default: false },
    readTime:  { type: Number, default: 3 },              // minutes — auto-calculated on save
    views:     { type: Number, default: 0 },
    order:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate readTime (avg 200 words/min) and slug before saving
postSchema.pre("save", function (next) {
  // Read time
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Auto-slug from title if not set
  if (!this.slug || this.slug === "") {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
