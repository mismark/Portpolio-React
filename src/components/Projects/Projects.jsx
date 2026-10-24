import { useState, useEffect } from "react";
import axios from "axios";
import "./Projects.css";
import {
  FaGithub, FaExternalLinkAlt, FaCode,
  FaTimes, FaExpand,
} from "react-icons/fa";
import useScrollReveal from "../../hooks/useScrollReveal";

const FALLBACK = [
  {
    _id: "1",
    title: "Amazon Delivery",
    description: "E-commerce delivery system with full cart functionality, product listing, and order management.",
    techStack: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/mismark/JavaScript-Amazon-Project",
    live: "https://amazon-online-shops.netlify.app/",
    featured: true,
  },
  {
    _id: "2",
    title: "BDU Document System",
    description: "Document request management system with admin control, used at Bahir Dar University.",
    techStack: ["PHP", "MySQL", "HTML", "CSS"],
    github: "https://github.com/mismark/BDU_Document_Request_Management_System",
    live: "",
    featured: true,
  },
  {
    _id: "3",
    title: "Car Rental System",
    description: "Car rental platform with vehicle listings, booking management, and admin dashboard.",
    techStack: ["PHP", "MySQL", "JavaScript"],
    github: "https://github.com/mismark/Car-Rental_System",
    live: "",
    featured: false,
  },
  {
    _id: "4",
    title: "Portfolio by React",
    description: "Personal portfolio website built with React, featuring sections for projects, skills, and contact.",
    techStack: ["React", "CSS", "Vite"],
    github: "https://github.com/mismark/Portpolio-React",
    live: "https://portpolio-react-rho.vercel.app/",
    featured: true,
  },
  {
    _id: "5",
    title: "Mini Projects Collection",
    description: "A collection of smaller projects and experiments including algorithms, UI components, and utilities.",
    techStack: ["JavaScript", "Python", "HTML"],
    github: "https://github.com/mismark",
    live: "",
    featured: false,
  },
];

/* ── Project Detail Modal ───────────────────────────────────────────────── */
function ProjectModal({ project, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon"><FaCode /></div>
          <div className="modal-title-wrap">
            <h2 className="modal-title">{project.title}</h2>
            {project.featured && <span className="project-featured-badge" style={{ position: "static" }}>Featured</span>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>

        {/* Image if exists */}
        {project.image && (
          <div className="modal-image-wrap">
            <img src={project.image} alt={project.title} className="modal-image" />
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          <p className="modal-desc">{project.description}</p>

          {/* Tech stack */}
          {project.techStack?.length > 0 && (
            <div className="modal-section">
              <h4>Tech Stack</h4>
              <div className="project-tech">
                {project.techStack.map((t) => (
                  <span key={t} className="tech-chip">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="modal-links">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn-primary modal-btn">
                <FaGithub /> View Code
              </a>
            )}
            {project.live && project.live !== "#" && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn-outline modal-btn">
                <FaExternalLinkAlt /> Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Projects Section ───────────────────────────────────────────────────── */
function Projects() {
  const [projects, setProjects]     = useState(FALLBACK);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const [selected, setSelected]     = useState(null);
  const revealHeader = useScrollReveal({ threshold: 0.1 });

  useEffect(() => {
    axios.get("/api/projects")
      .then((res) => { if (res.data?.data?.length) setProjects(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "featured"
    ? projects.filter((p) => p.featured)
    : projects;

  return (
    <section id="projects" className="projects section">
      <div className="container">
        <h2 className="section-title reveal fade-up" ref={revealHeader}>Projects</h2>
        <p className="section-subtitle">Things I've built</p>

        <div className="projects-filter">
          {["all", "featured"].map((f) => (
            <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All Projects" : "Featured"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="projects-loading">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="projects-grid">
            {filtered.map((project) => (
              <article key={project._id} className="project-card">
                {project.featured && <span className="project-featured-badge">Featured</span>}

                <div className="project-icon"><FaCode /></div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>

                {project.techStack?.length > 0 && (
                  <div className="project-tech">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="tech-chip">{tech}</span>
                    ))}
                  </div>
                )}

                <div className="project-links">
                  {/* Details button — opens modal */}
                  <button
                    className="project-link details-btn"
                    onClick={() => setSelected(project)}
                    aria-label={`View details for ${project.title}`}
                  >
                    <FaExpand /> Details
                  </button>

                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link">
                      <FaGithub /> Code
                    </a>
                  )}
                  {project.live && project.live !== "#" && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer" className="project-link live">
                      <FaExternalLinkAlt /> Live
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

export default Projects;
