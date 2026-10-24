import { useState, useEffect } from "react";
import axios from "axios";
import "./Certificates.css";
import {
  FaCertificate, FaExternalLinkAlt, FaCalendarAlt,
  FaTimes, FaAward, FaBuilding,
} from "react-icons/fa";
import useScrollReveal from "../../hooks/useScrollReveal";

const FALLBACK = [
  {
    _id: "c1",
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    date: "2023",
    credentialUrl: "https://freecodecamp.org",
    image: "",
  },
  {
    _id: "c2",
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    date: "2023",
    credentialUrl: "https://freecodecamp.org",
    image: "",
  },
  {
    _id: "c3",
    title: "React — The Complete Guide",
    issuer: "Udemy",
    date: "2024",
    credentialUrl: "",
    image: "",
  },
  {
    _id: "c4",
    title: "Node.js & Express Bootcamp",
    issuer: "Udemy",
    date: "2024",
    credentialUrl: "",
    image: "",
  },
];

const ISSUER_COLOR = {
  freecodecamp:        "#0a0a23",
  udemy:               "#a435f0",
  coursera:            "#0056d2",
  "linkedin learning": "#0077b5",
  google:              "#4285f4",
  microsoft:           "#00a4ef",
  aws:                 "#ff9900",
  meta:                "#0668e1",
};

function getIssuerColor(issuer = "") {
  return ISSUER_COLOR[issuer.toLowerCase()] ?? "#6366f1";
}

/* ── Certificate Detail Modal ───────────────────────────────────────────── */
function CertModal({ cert, onClose }) {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const color    = getIssuerColor(cert.issuer);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const imageSrc = cert.image
    ? (cert.image.startsWith("/uploads") ? `${API_BASE}${cert.image}` : cert.image)
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box cert-modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Colored header */}
        <div
          className="cert-modal-header"
          style={{ background: `linear-gradient(135deg, ${color}18, ${color}06)`, borderTop: `4px solid ${color}` }}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>

          {/* Badge / image */}
          <div className="cert-modal-image-wrap">
            {imageSrc ? (
              <img src={imageSrc} alt={cert.title} className="cert-modal-image" />
            ) : (
              <div className="cert-modal-icon" style={{ color }}>
                <FaCertificate />
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="cert-modal-body">
          <h2 className="cert-modal-title">{cert.title}</h2>

          <div className="cert-modal-meta">
            <div className="cert-modal-meta-item">
              <FaBuilding className="cert-modal-meta-icon" style={{ color }} />
              <div>
                <span className="cert-modal-meta-label">Issued by</span>
                <span className="cert-modal-meta-value" style={{ color, fontWeight: 700 }}>
                  {cert.issuer}
                </span>
              </div>
            </div>

            {cert.date && (
              <div className="cert-modal-meta-item">
                <FaCalendarAlt className="cert-modal-meta-icon" style={{ color }} />
                <div>
                  <span className="cert-modal-meta-label">Date earned</span>
                  <span className="cert-modal-meta-value">{cert.date}</span>
                </div>
              </div>
            )}

            <div className="cert-modal-meta-item">
              <FaAward className="cert-modal-meta-icon" style={{ color }} />
              <div>
                <span className="cert-modal-meta-label">Type</span>
                <span className="cert-modal-meta-value">Professional Certificate</span>
              </div>
            </div>
          </div>

          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary cert-modal-cta"
              onClick={(e) => e.stopPropagation()}
            >
              <FaExternalLinkAlt /> View Credential
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Certificates Section ───────────────────────────────────────────────── */
function Certificates() {
  const [certs, setCerts]     = useState(FALLBACK);
  const [selected, setSelected] = useState(null);
  const revealTitle = useScrollReveal();
  const API_BASE = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    axios.get("/api/certificates")
      .then((res) => { if (res.data?.data?.length) setCerts(res.data.data); })
      .catch(() => {});
  }, []);

  return (
    <section id="certificates" className="certificates section">
      <div className="container">
        <h2 className="section-title reveal fade-up" ref={revealTitle}>Certificates</h2>
        <p className="section-subtitle">Courses &amp; achievements — click a card to view details</p>

        <div className="certs-grid">
          {certs.map((cert) => {
            const color = getIssuerColor(cert.issuer);
            return (
              <div
                key={cert._id}
                className="cert-card"
                style={{ "--cert-color": color }}
                onClick={() => setSelected(cert)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${cert.title}`}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelected(cert); }}
              >
                {/* Large image area */}
                <div className="cert-image-wrap">
                  {cert.image ? (
                    <img
                      src={cert.image.startsWith("/uploads") ? `${API_BASE}${cert.image}` : cert.image}
                      alt={cert.title}
                    />
                  ) : (
                    <FaCertificate className="cert-icon-placeholder" />
                  )}
                </div>

                {/* Card body */}
                <div className="cert-body">
                  <h3 className="cert-title">{cert.title}</h3>

                  <div className="cert-meta">
                    <span className="cert-issuer" style={{ color }}>{cert.issuer}</span>
                    {cert.date && (
                      <span className="cert-date">
                        <FaCalendarAlt /> {cert.date}
                      </span>
                    )}
                  </div>

                  <div className="cert-card-footer">
                    <span className="cert-view-hint">Click to view details</span>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cert-link"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open credential for ${cert.title}`}
                      >
                        <FaExternalLinkAlt /> Open Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && <CertModal cert={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

export default Certificates;
