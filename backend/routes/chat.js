const express = require("express");
const router  = express.Router();
const { buildSystemPrompt, tryGemini, tryOpenAI, smartFallback } = require("./chatHelpers");

// ─── Rate limiting: 50 messages / 5 min per IP ───────────────────────────────
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now  = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - data.start > 5 * 60 * 1000) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (data.count >= 50) return false;
  data.count++;
  rateLimitMap.set(ip, data);
  return true;
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ success: false, message: "Too many messages. Please wait a few minutes." });
    }

    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }
    if (message.trim().length > 600) {
      return res.status(400).json({ success: false, message: "Message too long (max 600 chars)." });
    }

    const userMsg = message.trim();

    const cleanHistory = (Array.isArray(history) ? history : [])
      .slice(-24)
      .filter((m) => m?.role && m?.content)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content).slice(0, 600) }));

    let reply = null;

    // 1. Gemini (free — get key at aistudio.google.com/apikey)
    if (process.env.GEMINI_API_KEY?.length > 10) {
      try {
        const prompt = await buildSystemPrompt();
        reply = await tryGemini(prompt, cleanHistory, userMsg);
        console.log("[Chat] ✅ Gemini");
      } catch (e) { console.warn("[Chat] Gemini failed:", e?.message); }
    }

    // 2. OpenAI fallback
    if (!reply && process.env.OPENAI_API_KEY?.length > 10) {
      try {
        const prompt = await buildSystemPrompt();
        reply = await tryOpenAI(prompt, cleanHistory, userMsg);
        console.log("[Chat] ✅ OpenAI");
      } catch (e) { console.warn("[Chat] OpenAI failed:", e?.message); }
    }

    // 3. Built-in smart fallback — always works
    if (!reply) {
      reply = await smartFallback(userMsg);
      console.log("[Chat] ✅ Smart fallback");
    }

    res.json({ success: true, reply });

  } catch (err) {
    console.error("[Chat] Error:", err?.message);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
