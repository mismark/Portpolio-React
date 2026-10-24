import { useState, useEffect } from "react";
import axios from "axios";
import "./Testimonials.css";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import useScrollReveal from "../../hooks/useScrollReveal";

const FALLBACK = [
  {
    _id: "t1",
    name: "Dr. Abebe Girma",
    role: "Professor, Bahir Dar University",
    message: "Mekuanint is one of the most dedicated students I have taught. His ability to grasp complex concepts and apply them to real-world projects is outstanding.",
    rating: 5,
    avatar: "",
  },
  {
    _id: "t2",
    name: "Sara Tadesse",
    role: "Classmate & Project Partner",
    message: "Working with Mekuanint on our group project was a great experience. He always delivers clean, well-documented code and keeps the team moving forward.",
    rating: 5,
    avatar: "",
  },
  {
    _id: "t3",
    name: "Yohannes Bekele",
    role: "Client — Freelance Project",
    message: "He built exactly what I needed, on time and within budget. The website looks great and works perfectly on all devices. Highly recommended!",
    rating: 5,
    avatar: "",
  },
];

function Stars({ count = 5 }) {
  return (
    <div className="stars">
      {[...Array(5)].map((_, i) => (
        <FaStar key={i} className={i < count ? "star filled" : "star"} />
      ))}
    </div>
  );
}

function Testimonials() {
  const [items, setItems]     = useState(FALLBACK);
  const [active, setActive]   = useState(0);
  const revealTitle = useScrollReveal();

  useEffect(() => {
    axios.get("/api/testimonials")
      .then((res) => { if (res.data?.data?.length) setItems(res.data.data); })
      .catch(() => {});
  }, []);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const API_BASE = import.meta.env.VITE_API_URL || "";

  return (
    <section id="testimonials" className="testimonials section">
      <div className="container">
        <h2 className="section-title reveal fade-up" ref={revealTitle}>Testimonials</h2>
        <p className="section-subtitle">What others say about my work</p>

        {/* Cards — all shown on desktop, slider on mobile */}
        <div className="testimonials-grid">
          {items.map((item, idx) => (
            <div
              key={item._id}
              className={`testimonial-card${active === idx ? " active" : ""}`}
              onClick={() => setActive(idx)}
            >
              <FaQuoteLeft className="quote-icon" />

              <p className="testimonial-message">"{item.message}"</p>

              <Stars count={item.rating} />

              <div className="testimonial-author">
                <div className="author-avatar">
                  {item.avatar ? (
                    <img
                      src={item.avatar.startsWith("/uploads") ? `${API_BASE}${item.avatar}` : item.avatar}
                      alt={item.name}
                    />
                  ) : (
                    <span>{item.name.charAt(0)}</span>
                  )}
                </div>
                <div className="author-info">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="testimonial-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`dot${active === i ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
