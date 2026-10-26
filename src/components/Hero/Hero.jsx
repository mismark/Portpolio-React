import { useState, useEffect } from "react";
import "./Hero.css";
import defaultProfileImg from "../../assets/profile.jpg";
import { FaArrowDown, FaDownload } from "react-icons/fa";
import ParticleCanvas from "./ParticleCanvas";

// Fallback titles used before profile loads
const DEFAULT_TITLES = [
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "UI/UX Enthusiast",
];

function Hero({ profile, loading }) {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayed, setDisplayed]   = useState("");
  const [deleting, setDeleting]     = useState(false);
  const [charIndex, setCharIndex]   = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || "";

  // Use heroTitles from profile, fall back to defaults — must be above useEffect
  const TITLES = profile?.heroTitles?.length
    ? profile.heroTitles
    : DEFAULT_TITLES;

  // Typewriter effect
  useEffect(() => {
    const current = TITLES[titleIndex] ?? TITLES[0];
    let timeout;
    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex((i) => i + 1);
      }, 80);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex((i) => i - 1);
      }, 45);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setTitleIndex((i) => (i + 1) % TITLES.length);
    }
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIndex, deleting, titleIndex]);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // CV link — use uploaded CV from backend, fall back to static file
  const cvHref = profile?.cv
    ? `${API_BASE}${profile.cv}`
    : "/files/Mekuanint-CV.pdf";
  const photoSrc = profile?.photo
    ? `${API_BASE}${profile.photo}`
    : defaultProfileImg;

  // Split name — show first name highlighted, rest normal
  const firstName = profile?.name?.split(" ")[0] ?? "Mekuanint";

  const stats = [
    { value: `${profile?.stats?.yearsExperience ?? 1}+`,   label: "Year Exp."  },
    { value: `${profile?.stats?.projectsCompleted ?? 5}+`, label: "Projects"   },
    { value: `${profile?.stats?.skillsCount ?? 12}+`,      label: "Skills"     },
  ];

  return (
    <section className="hero section" id="home">
      <ParticleCanvas />
      <div className="container hero-inner">
        {/* ── Text side ── */}
        <div className="hero-text">
          <span className="hero-badge">👋 Available for work</span>

          <h1 className="hero-heading">
            Hi, I'm{" "}
            {loading ? (
              <span className="skeleton-text inline" style={{ width: 180 }} />
            ) : (
              <span className="gradient-text">{firstName}</span>
            )}
          </h1>

          <h2 className="hero-title">
            <span className="typewriter">{displayed}</span>
            <span className="cursor">|</span>
          </h2>

          <p className="hero-desc">
            {loading ? (
              <>
                <span className="skeleton-text" style={{ width: "100%" }} />
                <span className="skeleton-text" style={{ width: "70%" }} />
              </>
            ) : (
              profile?.bio
            )}
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={() => scrollTo("contact")}>
              Get In Touch
            </button>
            <a href={cvHref} download className="btn-outline">
              <FaDownload size={14} /> Download CV
            </a>
          </div>

          {/* Quick stats */}
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                {loading ? (
                  <span className="skeleton-text" style={{ width: 40, height: 28 }} />
                ) : (
                  <strong>{s.value}</strong>
                )}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Image side ── */}
        <div className="hero-image-wrap">
          <div className="hero-image-ring">
            <img src={photoSrc} alt={profile?.name ?? "Profile"} className="hero-img" />
          </div>
          <div className="hero-blob" aria-hidden="true" />
        </div>
      </div>

      {/* Scroll cue */}
      <button
        className="scroll-cue"
        onClick={() => scrollTo("about")}
        aria-label="Scroll to About"
      >
        <FaArrowDown />
      </button>
    </section>
  );
}

export default Hero;
