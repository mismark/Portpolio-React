import { useState } from "react";
import axios from "axios";
import "./Contact.css";
import { getPlatformMeta } from "../../utils/platformMeta";
import {
  FaEnvelope, FaMapMarkerAlt, FaTelegram,
  FaGithub, FaLinkedin, FaPaperPlane,
} from "react-icons/fa";

const INITIAL = { name: "", email: "", subject: "", message: "" };

function Contact({ profile }) {
  const [form, setForm]       = useState(INITIAL);
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Build contact info from profile (falls back to defaults) ──────────────
  const email    = profile?.email    || "mismarkol903@gmail.com";
  const location = profile?.location || "Bahir Dar, Ethiopia";
  const telegram = profile?.telegram || "https://t.me/mismarkol";
  const github   = profile?.github   || "https://github.com/mismark";
  const linkedin = profile?.linkedin || "https://linkedin.com";

  // Derive display handle from telegram URL e.g. "https://t.me/mismarkol" → "@mismarkol"
  const telegramHandle = telegram.startsWith("https://t.me/")
    ? `@${telegram.replace("https://t.me/", "")}`
    : telegram;

  const contactItems = [
    {
      icon:  <FaEnvelope />,
      label: "Email",
      value: email,
      href:  `mailto:${email}`,
    },
    {
      icon:  <FaMapMarkerAlt />,
      label: "Location",
      value: location,
      href:  null,
    },
    {
      icon:  <FaTelegram />,
      label: "Telegram",
      value: telegramHandle,
      href:  telegram,
    },
  ];

  // Fixed socials + extra socials from profile
  const fixedSocials = [
    { platform: "github",   href: github   },
    { platform: "linkedin", href: linkedin  },
    { platform: "telegram", href: telegram  },
  ];

  const extraSocials = (profile?.extraSocials || [])
    .filter((s) => s.platform && s.url)
    .map((s) => ({ platform: s.platform, href: s.url }));

  const allSocials = [...fixedSocials, ...extraSocials];

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await axios.post("/api/contact", form);
      setStatus({ type: "success", text: res.data.message });
      setForm(INITIAL);
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Failed to send message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">Have a project in mind? Let's talk.</p>

        <div className="contact-grid">
          {/* ── Info column ── */}
          <div className="contact-info">
            <h3>Let's work together</h3>
            <p>
              I'm currently open to freelance projects and internship
              opportunities. Feel free to reach out — I'll get back to you
              as soon as possible.
            </p>

            <ul className="contact-list">
              {contactItems.map((item) => (
                <li key={item.label}>
                  <span className="contact-icon">{item.icon}</span>
                  <div>
                    <span className="contact-label">{item.label}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="contact-value link"
                        target={item.href.startsWith("http") ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="contact-value">{item.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Social icons — fixed + extra from profile */}
            <div className="contact-socials">
              {allSocials.map((s, i) => {
                const { icon, color, label } = getPlatformMeta(s.platform);
                return (
                  <a
                    key={`${s.platform}-${i}`}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="social-icon-btn"
                    style={{ "--hover-color": color }}
                  >
                    {icon}
                  </a>
                );
              })}
            </div>

            {/* ── Telegram Support Bot CTA ── */}
            <a
              href="https://t.me/LihiketSupportBot"
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-support-cta"
              aria-label="Chat with support bot on Telegram"
            >
              <FaTelegram />
              <div className="telegram-support-text">
                <span className="telegram-support-title">Telegram Support Bot</span>
                <span className="telegram-support-sub">@LihiketSupportBot · Instant answers</span>
              </div>
            </a>
          </div>

          {/* ── Form column ── */}
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                name="subject"
                placeholder="Project inquiry"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Tell me about your project..."
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {status && (
              <div className={`form-status ${status.type}`} role="alert">
                {status.text}
              </div>
            )}

            <button
              className="btn-primary submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <><FaPaperPlane size={14} /> Send Message</>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
