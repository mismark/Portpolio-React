import { useState, useEffect } from "react";
import axios from "axios";
import "./Services.css";
import {
  FaCode, FaMobileAlt, FaServer, FaDatabase,
  FaPaintBrush, FaShoppingCart, FaCheck,
} from "react-icons/fa";
import useScrollReveal from "../../hooks/useScrollReveal";

// Icon lookup by string name stored in DB
const ICON_MAP = {
  FaCode:         <FaCode />,
  FaMobileAlt:    <FaMobileAlt />,
  FaServer:       <FaServer />,
  FaDatabase:     <FaDatabase />,
  FaPaintBrush:   <FaPaintBrush />,
  FaShoppingCart: <FaShoppingCart />,
};

const FALLBACK = [
  {
    _id: "s1",
    title: "Web Development",
    description: "Building fast, responsive, and accessible websites using modern technologies like React and Node.js.",
    icon: "FaCode",
    features: ["Responsive Design", "SEO Optimized", "Cross-browser Compatible", "Performance Focused"],
    price: "Contact for quote",
  },
  {
    _id: "s2",
    title: "Backend & API",
    description: "Designing and building robust REST APIs and server-side systems with Node.js, Express, and MongoDB.",
    icon: "FaServer",
    features: ["REST API Design", "Database Architecture", "Authentication & Auth", "Cloud Deployment"],
    price: "Contact for quote",
  },
  {
    _id: "s3",
    title: "Database Design",
    description: "Modeling and optimizing databases for performance, scalability, and data integrity.",
    icon: "FaDatabase",
    features: ["MongoDB / MySQL", "Schema Design", "Query Optimization", "Data Migration"],
    price: "Contact for quote",
  },
  {
    _id: "s4",
    title: "UI / UX Design",
    description: "Crafting clean, intuitive interfaces that look great and feel smooth to use.",
    icon: "FaPaintBrush",
    features: ["Wireframing", "Component Design", "CSS Animations", "Mobile First"],
    price: "Contact for quote",
  },
];

function Services() {
  const [services, setServices] = useState(FALLBACK);
  const revealTitle = useScrollReveal();

  useEffect(() => {
    axios.get("/api/services")
      .then((res) => { if (res.data?.data?.length) setServices(res.data.data); })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="services section">
      <div className="container">
        <h2 className="section-title reveal fade-up" ref={revealTitle}>Services</h2>
        <p className="section-subtitle">What I can do for you</p>

        <div className="services-grid">
          {services.map((svc) => (
            <div key={svc._id} className="service-card">
              <div className="service-icon-wrap">
                {ICON_MAP[svc.icon] ?? <FaCode />}
              </div>

              <h3 className="service-title">{svc.title}</h3>
              <p className="service-desc">{svc.description}</p>

              {svc.features?.length > 0 && (
                <ul className="service-features">
                  {svc.features.map((f, i) => (
                    <li key={i}>
                      <FaCheck className="service-check" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {svc.price && (
                <div className="service-price">{svc.price}</div>
              )}

              <a href="#contact" className="service-cta btn-primary"
                onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
