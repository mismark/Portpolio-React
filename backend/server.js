require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const connectDB    = require("./db");
const errorHandler = require("./middleware/errorHandler");
const protect      = require("./middleware/protect");
const projects     = require("./routes/projects");
const { createBot } = require("./telegramBot");

const app  = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === "production";

connectDB();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// In production CLIENT_URL must be set (e.g. https://yourportfolio.com).
// In development both Vite ports are allowed.
const allowedOrigins = isProd
  ? [process.env.CLIENT_URL].filter(Boolean)
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}));

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// ─── Static — uploaded files ──────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── In production: serve the built React app ─────────────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth",        require("./routes/auth"));
app.use("/api/contact",     require("./routes/contact"));
app.use("/api/profile",     require("./routes/profile"));

app.get(   "/api/projects",          projects.getAll);
app.get(   "/api/projects/:id",      projects.getOne);
app.post(  "/api/projects",          protect, projects.create);
app.put(   "/api/projects/:id",      protect, projects.update);
app.delete("/api/projects/:id",      protect, projects.remove);
app.use(   "/api/projects",          projects.router);

app.use("/api/seed",         protect, require("./routes/seed"));
app.use("/api/experience",   require("./routes/experience"));
app.use("/api/services",     require("./routes/services"));
app.use("/api/certificates", require("./routes/certificates"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/posts",        require("./routes/posts"));
app.use("/api/chat",         require("./routes/chat"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Portfolio API is running." });
});

// ─── SPA fallback (production) ────────────────────────────────────────────────
// Any non-API route serves index.html so React Router handles client-side routing
if (isProd) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found." });
  });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);

  // ─── Telegram Bot (long-polling) ─────────────────────────────────────────
  const bot = createBot();
  if (bot) {
    bot.launch()
      .then(() => console.log("🤖 Telegram bot launched (long-polling)"))
      .catch((err) => console.error("❌ Telegram bot failed to launch:", err?.message));

    // Graceful shutdown
    process.once("SIGINT",  () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  }
});
