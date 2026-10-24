import { useState, useEffect } from "react";
import axios from "axios";
import "./Experience.css";
import { FaBriefcase, FaGraduationCap, FaMapMarkerAlt } from "react-icons/fa";
import useScrollReveal from "../../hooks/useScrollReveal";

const FALLBACK = [
  {
    _id: "e1",
    type: "education",
    title: "BSc Information Systems",
    organization: "Bahir Dar University",
    location: "Bahir Dar, Ethiopia",
    startDate: "Sep 2022",
    endDate: "Present",
    current: true,
    description: "Studying Information Systems with a focus on web development, database design, and software engineering principles.",
  },
  {
    _id: "e2",
    type: "work",
    title: "Freelance Web Developer",
    organization: "Self-employed",
    location: "Remote",
    startDate: "Jan 2023",
    endDate: "Present",
    current: true,
    description: "Building responsive web applications for clients using React, Node.js, and MongoDB. Delivered 5+ projects on time.",
  },
];

function Experience() {
  const [items, setItems]   = useState(FALLBACK);
  const [filter, setFilter] = useState("all");
  const revealTitle = useScrollReveal();

  useEffect(() => {
    axios.get("/api/experience")
      .then((res) => { if (res.data?.data?.length) setItems(res.data.data); })
      .catch(() => {});
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <section id="experience" className="experience section">
      <div className="container">
        <h2 className="section-title reveal fade-up" ref={revealTitle}>Experience</h2>
        <p className="section-subtitle">My education &amp; work journey</p>

        {/* Filter tabs */}
        <div className="exp-filter">
          {["all", "work", "education"].map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "work" ? "Work" : "Education"}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="timeline">
          {filtered.map((item, idx) => (
            <div
              key={item._id}
              className={`timeline-item ${item.type}`}
            >
              {/* Dot */}
              <div className="timeline-dot">
                {item.type === "education" ? <FaGraduationCap /> : <FaBriefcase />}
              </div>

              {/* Card */}
              <div className="timeline-card">
                <div className="timeline-header">
                  <span className={`timeline-badge ${item.type}`}>
                    {item.type === "education" ? "Education" : "Work"}
                  </span>
                  <span className="timeline-date">
                    {item.startDate} — {item.current ? "Present" : item.endDate}
                  </span>
                </div>

                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-org">{item.organization}</p>

                {item.location && (
                  <p className="timeline-location">
                    <FaMapMarkerAlt /> {item.location}
                  </p>
                )}

                {item.description && (
                  <p className="timeline-desc">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
