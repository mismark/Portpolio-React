import "./About.css";
import defaultProfileImg from "../../assets/profile.jpg";
import { FaDownload, FaMapMarkerAlt, FaEnvelope, FaGraduationCap } from "react-icons/fa";

function About({ profile, loading }) {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const photoSrc = profile?.photo
    ? `${API_BASE}${profile.photo}`
    : defaultProfileImg;

  const infoItems = [
    {
      icon:  <FaGraduationCap />,
      label: "Education",
      value: "Information Systems — Bahir Dar University",
    },
    {
      icon:  <FaMapMarkerAlt />,
      label: "Location",
      value: profile?.location || "Bahir Dar, Ethiopia",
    },
    {
      icon:  <FaEnvelope />,
      label: "Email",
      value: profile?.email || "mismarkol903@gmail.com",
    },
  ];

  const yearsExp = profile?.stats?.yearsExperience ?? 1;

  return (
    <section id="about" className="about section">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">A little background on who I am</p>

        <div className="about-grid">
          {/* ── Image column ── */}
          <div className="about-image-wrap">
            <div className="about-image-frame">
              <img src={photoSrc} alt={profile?.name ?? "Profile"} />
            </div>
            <div className="about-badge">
              <strong>{yearsExp}+</strong>
              <span>Year{yearsExp !== 1 ? "s" : ""} of<br />Experience</span>
            </div>
          </div>

          {/* ── Text column ── */}
          <div className="about-content">
            <h3 className="about-name">
              I'm{" "}
              {loading ? (
                <span className="skeleton-text inline" style={{ width: 200 }} />
              ) : (
                <span className="gradient-text">{profile?.name}</span>
              )}
            </h3>
            <p className="about-role">
              {loading ? (
                <span className="skeleton-text" style={{ width: 220 }} />
              ) : (
                profile?.title
              )}
            </p>

            {loading ? (
              <>
                <span className="skeleton-text" style={{ width: "100%" }} />
                <span className="skeleton-text" style={{ width: "90%", marginTop: 8 }} />
                <span className="skeleton-text" style={{ width: "80%", marginTop: 8 }} />
              </>
            ) : (
              <p className="about-bio">{profile?.bio}</p>
            )}

            {/* Info list */}
            <ul className="about-info">
              {infoItems.map((item) => (
                <li key={item.label}>
                  <span className="info-icon">{item.icon}</span>
                  <span className="info-label">{item.label}:</span>
                  {loading ? (
                    <span className="skeleton-text inline" style={{ width: 160 }} />
                  ) : (
                    <span className="info-value">{item.value}</span>
                  )}
                </li>
              ))}
            </ul>

            <a href="/files/Mekuanint-CV.pdf" download className="btn-primary about-cv-btn">
              <FaDownload size={14} /> Download CV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
