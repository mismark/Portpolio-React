const { Telegraf, Markup } = require("telegraf");

// Reuse the same AI + fallback logic from the chat route
const {
  buildSystemPrompt,
  tryGemini,
  tryOpenAI,
  smartFallback,
} = require("./routes/chatHelpers");

// ─── Per-user conversation history (in-memory, TTL 30 min) ───────────────────
const sessions = new Map(); // chatId → { history: [], lastAt: Date }

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

function getHistory(chatId) {
  const now = Date.now();
  const s   = sessions.get(chatId);
  if (!s || now - s.lastAt > SESSION_TTL) {
    sessions.set(chatId, { history: [], lastAt: now });
    return [];
  }
  s.lastAt = now;
  return s.history;
}

function pushHistory(chatId, role, content) {
  const s = sessions.get(chatId);
  if (!s) return;
  s.history.push({ role, content: content.slice(0, 600) });
  // Keep last 24 turns
  if (s.history.length > 24) s.history.splice(0, s.history.length - 24);
}

// ─── Rate limiting: 30 messages / 5 min per chat ─────────────────────────────
const rateLimitMap = new Map();

function checkRateLimit(chatId) {
  const now  = Date.now();
  const data = rateLimitMap.get(chatId) || { count: 0, start: now };
  if (now - data.start > 5 * 60 * 1000) {
    rateLimitMap.set(chatId, { count: 1, start: now });
    return true;
  }
  if (data.count >= 30) return false;
  data.count++;
  rateLimitMap.set(chatId, data);
  return true;
}

// ─── Markdown → Telegram-safe text ───────────────────────────────────────────
// Telegraf "HTML" parse mode is safest; convert **bold** → <b>bold</b>
function toHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g,     "<i>$1</i>")
    .replace(/`(.+?)`/g,       "<code>$1</code>")
    .replace(/•/g, "•"); // keep bullet dots
}

// ─── AI reply helper ──────────────────────────────────────────────────────────
async function getAIReply(history, userMsg) {
  let reply = null;

  if (process.env.GEMINI_API_KEY?.length > 10) {
    try {
      const prompt = await buildSystemPrompt();
      reply = await tryGemini(prompt, history, userMsg);
      console.log("[TelegramBot] ✅ Gemini");
    } catch (e) { console.warn("[TelegramBot] Gemini failed:", e?.message); }
  }

  if (!reply && process.env.OPENAI_API_KEY?.length > 10) {
    try {
      const prompt = await buildSystemPrompt();
      reply = await tryOpenAI(prompt, history, userMsg);
      console.log("[TelegramBot] ✅ OpenAI");
    } catch (e) { console.warn("[TelegramBot] OpenAI failed:", e?.message); }
  }

  if (!reply) {
    reply = await smartFallback(userMsg);
    console.log("[TelegramBot] ✅ Smart fallback");
  }

  return reply;
}

// ─── Build & start the bot ────────────────────────────────────────────────────
function createBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[TelegramBot] ⚠️  TELEGRAM_BOT_TOKEN not set — bot disabled.");
    return null;
  }

  const bot = new Telegraf(token);

  // ── /start ──────────────────────────────────────────────────────────────
  bot.start(async (ctx) => {
    const name = ctx.from?.first_name ?? "there";
    sessions.delete(ctx.chat.id); // fresh session on /start

    await ctx.replyWithHTML(
      `👋 Hello <b>${name}</b>! I'm Mekuanint's AI assistant.\n\n` +
      `I can answer questions about his <b>skills</b>, <b>projects</b>, ` +
      `<b>experience</b>, <b>services</b>, and how to <b>hire him</b>.\n\n` +
      `Just type your question or pick one below! 👇`,
      Markup.keyboard([
        ["💼 Projects",      "🛠️ Skills"],
        ["📋 Services",      "📜 Certificates"],
        ["📞 Contact Info",  "💰 Hire Him"],
        ["👤 About Mekuanint"],
      ]).resize()
    );
  });

  // ── /help ────────────────────────────────────────────────────────────────
  bot.help((ctx) =>
    ctx.replyWithHTML(
      `<b>What can I help you with?</b>\n\n` +
      `• <b>Projects</b> — what he has built\n` +
      `• <b>Skills</b> — technologies he knows\n` +
      `• <b>Services</b> — what he offers & pricing\n` +
      `• <b>Certificates</b> — his credentials\n` +
      `• <b>Experience</b> — work & education history\n` +
      `• <b>Contact</b> — how to reach him\n\n` +
      `Just ask anything or use the keyboard below! 😊`
    )
  );

  // ── /clear — reset conversation history ──────────────────────────────────
  bot.command("clear", (ctx) => {
    sessions.delete(ctx.chat.id);
    ctx.reply("✅ Conversation cleared. Fresh start!");
  });

  // ── Handle all text messages (including keyboard buttons) ────────────────
  bot.on("text", async (ctx) => {
    const chatId  = ctx.chat.id;
    const rawText = ctx.message.text.trim();

    // Map keyboard button labels → natural questions
    const buttonMap = {
      "💼 Projects":         "Show me your projects",
      "🛠️ Skills":           "What are your skills?",
      "📋 Services":         "What services do you offer?",
      "📜 Certificates":     "What certificates do you have?",
      "📞 Contact Info":     "How can I contact you?",
      "💰 Hire Him":         "Are you available for hire?",
      "👤 About Mekuanint":  "Tell me about Mekuanint",
    };

    const userMsg = buttonMap[rawText] ?? rawText;

    // Rate limit check
    if (!checkRateLimit(chatId)) {
      return ctx.reply("⏳ You're sending messages too fast. Please wait a moment.");
    }

    // Message length guard
    if (userMsg.length > 600) {
      return ctx.reply("❌ Message too long (max 600 characters). Please shorten it.");
    }

    const history = getHistory(chatId);

    // Show typing indicator
    await ctx.sendChatAction("typing");

    try {
      const reply = await getAIReply(history, userMsg);

      // Push to session history
      pushHistory(chatId, "user",      userMsg);
      pushHistory(chatId, "assistant", reply);

      await ctx.replyWithHTML(toHtml(reply));
    } catch (err) {
      console.error("[TelegramBot] Error:", err?.message);
      await ctx.reply("⚠️ Something went wrong. Please try again.");
    }
  });

  // ── Graceful error handling ───────────────────────────────────────────────
  bot.catch((err, ctx) => {
    console.error(`[TelegramBot] Unhandled error for update ${ctx?.update?.update_id}:`, err?.message);
  });

  return bot;
}

module.exports = { createBot };
