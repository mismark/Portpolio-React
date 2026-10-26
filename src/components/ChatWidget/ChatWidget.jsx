import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./ChatWidget.css";
import {
  FaTimes, FaPaperPlane, FaRobot, FaRegCopy, FaCheck,
  FaMicrophone, FaTelegram,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

const SUGGESTIONS = [
  "What technologies do you work with?",
  "Show me your projects",
  "Are you available for hire?",
  "How can I reach you?",
  "What services do you offer?",
  "Tell me about your background",
];

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderText(text) {
  const lines = text.split("\n");
  const result = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      result.push(
        <ul key={`ul-${result.length}`} className="chat-list">
          {listItems.map((li, i) => <li key={i}>{formatInline(li)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const bullet = line.match(/^[•\-\*]\s+(.+)/);
    if (bullet) {
      listItems.push(bullet[1]);
    } else {
      flushList();
      if (line.trim() === "") {
        result.push(<span key={i} className="chat-br" />);
      } else {
        result.push(<span key={i} className="chat-line">{formatInline(line)}</span>);
      }
    }
  });
  flushList();
  return result;
}

function formatInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="bubble-copy" title="Copy"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <FaCheck /> : <FaRegCopy />}
    </button>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="chat-row assistant">
      <div className="chat-avatar-sm"><FaRobot /></div>
      <div className="typing-indicator"><span /><span /><span /></div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function ChatWidget({ profile }) {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [unread, setUnread]       = useState(0);
  const [showSugg, setShowSugg]   = useState(true);

  // Voice input state (mic only — TTS disabled)
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);

  const firstName = profile?.name?.split(" ")[0] ?? "Mekuanint";

  // ── Init Speech Recognition ─────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicSupported(false);
      return;
    }

    const rec          = new SR();
    rec.continuous     = false;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      const isFinal    = e.results[e.results.length - 1].isFinal;
      setInput(transcript);
      if (isFinal) {
        setListening(false);
        // auto-send after a short delay so state updates first
        setTimeout(() => sendVoice(transcript), 100);
      }
    };

    rec.onend   = () => setListening(false);
    rec.onerror = (err) => {
      if (err.error !== "no-speech") console.warn("STT error:", err.error);
      setListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  // ── Greet on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setUnread(0);
    if (messages.length === 0) {
      const greeting = {
        role:    "assistant",
        content: `Hello! 👋 I'm ${firstName}'s AI assistant.\n\nAsk me about his **skills**, **projects**, **experience**, or **availability**. You can also tap the 🎤 mic to speak!`,
        time:    new Date(),
      };
      setMessages([greeting]);
    }
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Mic toggle ────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Your browser does not support voice input. Please use Chrome or Edge.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setInput("");
      try {
        rec.start();
        setListening(true);
      } catch (e) {
        console.warn("Mic start error:", e.message);
      }
    }
  }, [listening]);

  // ── Send helpers ─────────────────────────────────────────────────────────
  const sendVoice = useCallback(async (text) => {
    const msg = text?.trim();
    if (!msg) return;
    setInput("");
    await doSend(msg);
  }, [messages]);

  const sendTyped = useCallback(async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    await doSend(msg);
  }, [input, loading, messages]);

  const doSend = async (msg) => {
    setShowSugg(false);

    const userMsg = { role: "user", content: msg, time: new Date() };
    const next    = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", {
        message: msg,
        history: next.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      });

      const reply = res.data.reply || res.data.message || "I'm not sure. Could you rephrase?";
      const aMsg  = { role: "assistant", content: reply, time: new Date() };
      setMessages((prev) => [...prev, aMsg]);
      if (!open) setUnread((n) => n + 1);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg, time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTyped();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const clearChat = () => {
    setMessages([]);
    setShowSugg(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* FAB */}
      <button
        className={`chat-fab${open ? " active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open AI assistant"}
      >
        <span className="chat-fab-icon">
          {open ? <FaTimes /> : <HiSparkles />}
        </span>
        {!open && unread > 0 && <span className="chat-fab-badge">{unread}</span>}
        {!open && <span className="chat-fab-pulse" />}
      </button>

      {/* Panel */}
      <div
        className={`chat-panel${open ? " open" : ""}`}
        role="dialog"
        aria-label="AI portfolio assistant"
        aria-modal="true"
      >
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-header-avatar">
              <FaRobot />
              <span className="online-pulse" />
            </div>
            <div className="chat-header-text">
              <p className="chat-header-title">{firstName}'s AI Assistant</p>
              <p className="chat-header-sub">
                <span className="online-dot" />
                {listening ? " Listening…" : " Online · Always here"}
              </p>
            </div>
          </div>
          <div className="chat-header-actions">
            {messages.length > 1 && (
              <button className="chat-hdr-btn" onClick={clearChat} title="Clear chat">↺</button>
            )}
            <button className="chat-hdr-btn" onClick={() => setOpen(false)} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          <div className="chat-date-sep"><span>Today</span></div>

          {messages.map((m, i) => (
            <div key={i} className={`chat-row ${m.role}`}>
              {m.role === "assistant" && (
                <div className="chat-avatar-sm"><FaRobot /></div>
              )}
              <div className="chat-bubble-wrap">
                <div className={`chat-bubble ${m.role}`}>
                  <div className="bubble-content">{renderText(m.content)}</div>
                  {m.role === "assistant" && <CopyButton text={m.content} />}
                </div>
                <span className="bubble-time">{m.time ? formatTime(m.time) : ""}</span>
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSugg && messages.filter((m) => m.role === "user").length === 0 && (
          <div className="chat-suggestions">
            <p className="suggestions-label">Quick questions</p>
            <div className="suggestions-grid">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="suggestion-chip" onClick={() => doSend(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="chat-input-area">

          {/* Input row */}
          <div className={`chat-input-row${listening ? " is-listening" : ""}`}>

            {/* ── MIC BUTTON — always visible on the left ── */}
            <button
              className={`mic-btn${listening ? " mic-active" : ""}${!micSupported ? " mic-disabled" : ""}`}
              onClick={toggleMic}
              title={listening ? "Stop listening" : micSupported ? "Tap to speak" : "Voice not supported in this browser"}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
            >
              <FaMicrophone />
              {listening && <span className="mic-ring" />}
            </button>

            {/* ── TEXTAREA ── */}
            <textarea
              ref={inputRef}
              className="chat-textarea"
              placeholder={listening ? "Listening… 🎤" : "Type a message…"}
              value={input}
              onInput={handleInputChange}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              maxLength={600}
              disabled={loading}
            />

            {/* ── SEND BUTTON ── */}
            <button
              className={`send-btn${input.trim() ? " send-ready" : ""}`}
              onClick={sendTyped}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? <span className="send-spinner" /> : <FaPaperPlane />}
            </button>
          </div>

          <p className="chat-footer-note">
            <HiSparkles /> Powered by AI · Tap 🎤 to speak
          </p>

          {/* ── Telegram CTA — always visible, bot link as fallback ── */}
          <a
            className="chat-telegram-cta"
            href={profile?.telegram || "https://t.me/LihiketSupportBot"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on Telegram"
          >
            <FaTelegram />
            <span>Chat on Telegram Support Bot</span>
          </a>

        </div>
      </div>
    </>
  );
}
