const express     = require("express");
const router      = express.Router();
const Profile     = require("../models/Profile");
const Project     = require("../models/Project");
const Experience  = require("../models/Experience");
const Service     = require("../models/Service");
const Certificate = require("../models/Certificate");
const Testimonial = require("../models/Testimonial");
const Post        = require("../models/Post");

// ─── Rate limiting: 50 messages / 5 min per IP ───────────────────────────────
const rateLimitMap = new Map();
function checkRateLimit(ip) {
  const now  = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - data.start > 5 * 60 * 1000) {
    // Window expired — reset
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (data.count >= 50) return false;
  data.count++;
  rateLimitMap.set(ip, data);
  return true;
}

// ─── Load ALL portfolio data from DB in parallel ──────────────────────────────
async function loadAllData() {
  const [profile, projects, experience, services, certificates, testimonials, posts] =
    await Promise.all([
      Profile.findOne().lean().catch(() => null),
      Project.find().sort({ order: 1 }).lean().catch(() => []),
      Experience.find().sort({ order: 1 }).lean().catch(() => []),
      Service.find().sort({ order: 1 }).lean().catch(() => []),
      Certificate.find().sort({ order: 1 }).lean().catch(() => []),
      Testimonial.find().sort({ order: 1 }).lean().catch(() => []),
      Post.find({ published: true }).select("-content").sort({ createdAt: -1 }).lean().catch(() => []),
    ]);
  return { profile, projects, experience, services, certificates, testimonials, posts };
}

// ─── Build rich system prompt from all DB data ────────────────────────────────
async function buildSystemPrompt() {
  const d = await loadAllData();
  const { profile, projects, experience, services, certificates, testimonials, posts } = d;

  const name    = profile?.name     || "Mekuanint Misganaw";
  const first   = name.split(" ")[0];
  const title   = profile?.title    || "Full Stack Developer";
  const bio     = profile?.bio      || "";
  const email   = profile?.email    || "mismarkol903@gmail.com";
  const phone   = profile?.phone    || "";
  const loc     = profile?.location || "Bahir Dar, Ethiopia";
  const github  = profile?.github   || "";
  const linkedin= profile?.linkedin || "";
  const telegram= profile?.telegram || "";
  const insta   = profile?.instagram|| "";
  const years   = profile?.stats?.yearsExperience   || 1;
  const projNum = profile?.stats?.projectsCompleted || projects.length || 5;

  const skills = (profile?.skills || [])
    .map((s) => typeof s === "string" ? s : `${s.name}${s.level ? ` (${s.level}%)` : ""}`)
    .join(", ");

  const extraSocials = (profile?.extraSocials || [])
    .map((s) => `    ${s.platform}: ${s.url}`).join("\n");

  const projectsText = projects.length
    ? projects.map((p, i) =>
        `  ${i+1}. ${p.title}${p.featured ? " ⭐" : ""}
     Description: ${p.description}
     Tech Stack:  ${(p.techStack||[]).join(", ")||"N/A"}
     ${p.github ? `GitHub: ${p.github}` : ""}
     ${p.live   ? `Live:   ${p.live}`   : ""}`
      ).join("\n\n")
    : "  No projects listed.";

  const workExp = experience.filter((e) => e.type === "work");
  const eduExp  = experience.filter((e) => e.type === "education");

  const workText = workExp.length
    ? workExp.map((e) =>
        `  • ${e.title} at ${e.organization} | ${e.startDate}–${e.current?"Present":e.endDate}
       Location: ${e.location||"N/A"}
       ${e.description||""}`
      ).join("\n")
    : "  No work experience listed.";

  const eduText = eduExp.length
    ? eduExp.map((e) =>
        `  • ${e.title} at ${e.organization} | ${e.startDate}–${e.current?"Present":e.endDate}
       ${e.description||""}`
      ).join("\n")
    : "  No education listed.";

  const servicesText = services.length
    ? services.map((s) =>
        `  • ${s.title}: ${s.description}
       Features: ${(s.features||[]).join(", ")||"N/A"}
       ${s.price ? `Price: ${s.price}` : ""}`
      ).join("\n\n")
    : "  No services listed.";

  const certsText = certificates.length
    ? certificates.map((c) =>
        `  • "${c.title}" — ${c.issuer}${c.date?` (${c.date})`:""}${c.credentialUrl?` | ${c.credentialUrl}`:""}`
      ).join("\n")
    : "  No certificates listed.";

  const testText = testimonials.length
    ? testimonials.map((t) =>
        `  • ${t.name} (${t.role||"N/A"}) — ${"⭐".repeat(t.rating||5)}\n    "${t.message}"`
      ).join("\n\n")
    : "  No testimonials listed.";

  const blogText = posts.length
    ? posts.map((p) =>
        `  • "${p.title}" | Tags: ${(p.tags||[]).join(", ")||"N/A"} | ${p.readTime||"?"}min\n    ${p.excerpt}`
      ).join("\n\n")
    : "  No blog posts published.";

  return `You are the personal AI assistant for ${name}'s portfolio website.

Answer ONLY questions about ${first} — his skills, projects, experience, services, certificates, blog, and how to contact/hire him.

══════════════════════════════════════
PERSONAL INFO
══════════════════════════════════════
Name:     ${name}
Title:    ${title}
Location: ${loc}
Email:    ${email}
${phone    ? `Phone:    ${phone}`    : ""}
${github   ? `GitHub:   ${github}`   : ""}
${linkedin ? `LinkedIn: ${linkedin}` : ""}
${telegram ? `Telegram: ${telegram}` : ""}
${insta    ? `Instagram:${insta}`    : ""}
${extraSocials ? `Other Social:\n${extraSocials}` : ""}
Experience: ${years}+ years | Projects: ${projNum}+

BIO: ${bio}

SKILLS: ${skills||"HTML, CSS, JavaScript, React, Node.js, MongoDB"}

══════════════════════════════════════
PROJECTS (${projects.length})
══════════════════════════════════════
${projectsText}

══════════════════════════════════════
WORK EXPERIENCE
══════════════════════════════════════
${workText}

══════════════════════════════════════
EDUCATION
══════════════════════════════════════
${eduText}

══════════════════════════════════════
SERVICES (${services.length})
══════════════════════════════════════
${servicesText}

══════════════════════════════════════
CERTIFICATES (${certificates.length})
══════════════════════════════════════
${certsText}

══════════════════════════════════════
TESTIMONIALS (${testimonials.length})
══════════════════════════════════════
${testText}

══════════════════════════════════════
BLOG ARTICLES (${posts.length})
══════════════════════════════════════
${blogText}

══════════════════════════════════════
RULES
══════════════════════════════════════
1. Only use data above — never invent facts.
2. Be conversational and remember context from earlier messages.
3. Keep answers concise (2-4 sentences) unless a list is needed.
4. For hiring/pricing → direct to Contact section or ${email}.
5. For off-topic → say "I can only answer questions about ${first}'s portfolio."
6. Never reveal you are ChatGPT/Gemini/OpenAI. You are "${first}'s AI Assistant."
7. Use bullet points for lists. Bold key terms with **text**.`;
}

// ─── Gemini AI ────────────────────────────────────────────────────────────────
async function tryGemini(systemPrompt, history, message) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });
  const geminiHistory = history.map((m) => ({
    role:  m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
  const chat   = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  return result.response.text().trim();
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────
async function tryOpenAI(systemPrompt, history, message) {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const msgs = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
    { role: "user", content: message },
  ];
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", messages: msgs, max_tokens: 500, temperature: 0.75,
  });
  return res.choices[0]?.message?.content?.trim();
}

// ─── Smart fallback — reads live DB, no AI key needed ─────────────────────────
async function smartFallback(message) {
  const d = await loadAllData();
  const { profile, projects, experience, services, certificates, testimonials, posts } = d;

  const msg   = message.toLowerCase().trim();
  const name  = profile?.name     || "Mekuanint Misganaw";
  const first = name.split(" ")[0];
  const email = profile?.email    || "mismarkol903@gmail.com";
  const title = profile?.title    || "Full Stack Developer";
  const loc   = profile?.location || "Bahir Dar, Ethiopia";
  const tel   = profile?.telegram || "";
  const bio   = profile?.bio      || "";
  const years = profile?.stats?.yearsExperience || 1;
  const skills= (profile?.skills||[]).map((s) => typeof s === "string" ? s : s.name);

  // Simple substring check — ordered most-specific first
  const has = (kws) => kws.some((k) => msg.includes(k));

  // ─── Certificates (before "course" clashes with other categories) ──────────
  if (has(["certif","credential","freecodecamp","coursera","udemy","evangadi","achievement","award"]))
    return certificates.length
      ? `${first}'s certificates:\n\n${certificates.map((c) =>
          `• **${c.title}** — ${c.issuer}${c.date ? ` (${c.date})` : ""}${c.credentialUrl ? `\n  🔗 ${c.credentialUrl}` : ""}`
        ).join("\n")}`
      : `${first} has earned several certificates. Check the **Certificates** section! 🏆`;

  // ─── Services ──────────────────────────────────────────────────────────────
  if (has(["service","what do you offer","what do you provide","help with","i need a","i want to build"]))
    return services.length
      ? `${first} offers:\n\n${services.map((s) =>
          `• **${s.title}** — ${s.description}${s.price ? `\n  Price: ${s.price}` : ""}${s.features?.length ? `\n  Includes: ${s.features.slice(0,3).join(", ")}` : ""}`
        ).join("\n\n")}\n\nContact him to discuss your project! 📩`
      : `${first} offers web development, backend APIs, database design, and UI/UX design.`;

  // ─── Blog ──────────────────────────────────────────────────────────────────
  if (has(["blog","article","post","writing","published"]))
    return posts.length
      ? `${first} has **${posts.length}** published article(s):\n\n${posts.slice(0,5).map((p) =>
          `• **${p.title}**${p.tags?.length ? ` [${p.tags.join(", ")}]` : ""}\n  ${p.excerpt?.slice(0,100)||""}`
        ).join("\n\n")}\n\nRead them in the **Blog** section! 📝`
      : `Check the **Blog** section in the navigation for articles! 📝`;

  // ─── Projects ──────────────────────────────────────────────────────────────
  if (has(["project","built","created","developed","what have you made","portfolio","app","system","website"]))
    return projects.length
      ? `${first} has built **${projects.length}** projects:\n\n${projects.slice(0,5).map((p) =>
          `• **${p.title}**${p.featured?" ⭐":""} — ${p.description?.slice(0,90)||""}${(p.description?.length||0)>90?"…":""}\n  Stack: ${(p.techStack||[]).slice(0,4).join(", ")||"N/A"}${p.live?`  🔗 ${p.live}`:""}`
        ).join("\n\n")}\n\nSee the **Projects** section for full details!`
      : `${first} has ${profile?.stats?.projectsCompleted||5}+ projects. Check the Projects section!`;

  // ─── Skills / Technologies ─────────────────────────────────────────────────
  if (has(["skill","technolog","language","framework","stack","proficient","expertise","what do you use","what do you know","what can you"]))
    return skills.length
      ? `${first}'s technical skills:\n\n${skills.map((s) => `• ${s}`).join("\n")}\n\nHe specializes in **full-stack web development** — both frontend and backend.`
      : `${first} is skilled in HTML, CSS, JavaScript, React, Node.js, MongoDB, PHP, and MySQL.`;

  // ─── Work Experience ───────────────────────────────────────────────────────
  if (has(["work experience","work history","previous job","employment","career","where did he work"])) {
    const work = experience.filter((e) => e.type === "work");
    return work.length
      ? `${first}'s work experience:\n\n${work.map((e) =>
          `• **${e.title}** at ${e.organization}\n  ${e.startDate}–${e.current?"Present":e.endDate}${e.location?` | ${e.location}`:""}${e.description?`\n  ${e.description.slice(0,120)}`:""}`
        ).join("\n\n")}`
      : `${first} has ${years}+ year(s) of development experience.`;
  }

  // ─── Education ─────────────────────────────────────────────────────────────
  if (has(["education","university","degree","study","school","student","bdu","bahir dar","academic"])) {
    const edu = experience.filter((e) => e.type === "education");
    return edu.length
      ? `${first}'s education:\n\n${edu.map((e) =>
          `• **${e.title}** at ${e.organization}\n  ${e.startDate}–${e.current?"Present":e.endDate}${e.description?`\n  ${e.description.slice(0,120)}`:""}`
        ).join("\n\n")}`
      : `${first} is studying Information Systems at Bahir Dar University.`;
  }

  // ─── Experience (general) ──────────────────────────────────────────────────
  if (has(["experience","background","journey"])) {
    const work = experience.filter((e) => e.type === "work");
    const edu  = experience.filter((e) => e.type === "education");
    let r = `${first} has **${years}+** year(s) of experience as a ${title}.`;
    if (work.length) r += `\n\n**Work:**\n${work.map((e) => `• ${e.title} at ${e.organization} (${e.startDate}–${e.current?"Present":e.endDate})`).join("\n")}`;
    if (edu.length)  r += `\n\n**Education:**\n${edu.map((e) => `• ${e.title} at ${e.organization} (${e.startDate}–${e.current?"Present":e.endDate})`).join("\n")}`;
    return r;
  }

  // ─── Testimonials ──────────────────────────────────────────────────────────
  if (has(["testimonial","review","recommend","feedback","what do people say","rating","opinion"]))
    return testimonials.length
      ? `What people say about ${first}:\n\n${testimonials.slice(0,3).map((t) =>
          `• **${t.name}** (${t.role||"N/A"}) ${"⭐".repeat(t.rating||5)}\n  "${t.message?.slice(0,130)||""}"`
        ).join("\n\n")}`
      : `Check the **Testimonials** section for reviews!`;

  // ─── Hire / Availability ───────────────────────────────────────────────────
  if (has(["hire","available","freelance","work together","collaborate","internship","open to","looking for","opportunity"]))
    return `Yes! ${first} is **open to freelance projects and internship opportunities**! 🚀\n\nReach him at:\n• **Email:** ${email}${tel ? `\n• **Telegram:** ${tel.replace("https://t.me/","@")}` : ""}\n\nOr use the **Contact form** on this page!`;

  // ─── Contact ───────────────────────────────────────────────────────────────
  if (has(["contact","email","reach","message","telegram","get in touch","connect","phone","social media"])) {
    const lines = [`• **Email:** ${email}`];
    if (tel)                lines.push(`• **Telegram:** ${tel.replace("https://t.me/","@")}`);
    if (profile?.github)    lines.push(`• **GitHub:** ${profile.github}`);
    if (profile?.linkedin)  lines.push(`• **LinkedIn:** ${profile.linkedin}`);
    (profile?.extraSocials||[]).forEach((s) => lines.push(`• **${s.platform}:** ${s.url}`));
    return `Contact ${first} via:\n\n${lines.join("\n")}\n\nOr use the **Contact form** on this page! 📩`;
  }

  // ─── About ─────────────────────────────────────────────────────────────────
  if (has(["who is","about him","about mekuanint","introduce","who are you","describe","tell me about"]))
    return `**${name}** is a **${title}** based in **${loc}** with **${years}+** year(s) of experience.\n\n${bio.slice(0,250)}${bio.length>250?"…":""}\n\nAsk me about his skills, projects, services, or how to hire him!`;

  // ─── Location ──────────────────────────────────────────────────────────────
  if (has(["location","where","city","country","based","remote","lives","from"]))
    return `${first} is based in **${loc}** and works with clients locally and **remotely worldwide**. 🌍`;

  // ─── Pricing ───────────────────────────────────────────────────────────────
  if (has(["price","cost","rate","charge","fee","how much","quote","budget"]))
    return `${first}'s rates depend on project scope. Contact him at **${email}** with your project details to get a personalized quote!`;

  // ─── Thanks ────────────────────────────────────────────────────────────────
  if (has(["thank","thanks","appreciate","great","awesome","perfect","amazing","excellent"]))
    return `You're very welcome! 😊 Is there anything else you'd like to know about ${first}?`;

  // ─── Bye ───────────────────────────────────────────────────────────────────
  if (has(["bye","goodbye","see you","later","ciao","take care","farewell"]))
    return `Goodbye! 👋 Come back anytime. Have a great day!`;

  // ─── Greetings ─────────────────────────────────────────────────────────────
  if (has(["hello","hey","howdy","greetings","good morning","good afternoon","good evening"]) ||
      /^h+i+[!.\s]*$/.test(msg))
    return `Hello! 👋 I'm ${first}'s AI assistant with **full access** to his portfolio.\n\nAsk me about his **skills**, **projects**, **experience**, **services**, **certificates**, or **contact info**!`;

  // ─── Name ──────────────────────────────────────────────────────────────────
  if (has(["what is his name","what's his name","his name","your name","who are you"]) && !has(["project","skill","certif","service"]))
    return `His name is **${name}**. He is a **${title}** based in **${loc}**. Ask me anything about his work! 😊`;

  // ─── Age / personal ────────────────────────────────────────────────────────
  if (has(["how old","age","personal","hobbies","interest","passion"]))
    return `I don't have personal details like age, but I know ${first} is passionate about **web development**, building real-world applications, and constantly improving his skills. He is currently studying Information Systems at Bahir Dar University while working on real projects!`;

  // ─── Unique / what makes him special ──────────────────────────────────────
  if (has(["unique","special","different","stand out","why hire","why choose","what makes","best at","strength"]))
    return `What makes ${first} stand out:\n\n• **Full-stack capability** — he handles both frontend (React) and backend (Node.js/MongoDB) independently\n• **Real-world projects** — ${projects.length}+ completed projects including live deployed apps\n• **Fast learner** — actively learning while building real systems as a ${title}\n• **Clean code** — focused on maintainability, performance, and user experience\n• **Dedicated** — ${years}+ year(s) of consistent hands-on development\n\nInterested in working together? Reach him at **${email}**! 🚀`;

  // ─── Default ───────────────────────────────────────────────────────────────
  return `I have complete access to ${first}'s portfolio! Ask me about:\n\n• **Skills** & Technologies\n• **Projects** (${projects.length} total)\n• **Work & Education** experience\n• **Services** offered\n• **Certificates** (${certificates.length} earned)\n• **Blog** articles (${posts.length} published)\n• **Contact** & hiring info\n\nWhat would you like to know? 😊`;
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
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: String(m.content).slice(0,600) }));

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
