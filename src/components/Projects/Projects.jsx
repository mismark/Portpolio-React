import "./Projects.css";

function Projects() {
  const projects = [
    {
      title: "Amazon Delivery",
      desc: "E-commerce delivery system with cart functionality.",
      github: "https://github.com/mismark/JavaScript-Amazon-Project",
      live: "https://your-live-link.com" // replace if you have
    },
    {
      title: "BDU Document System",
      desc: "Document request management system with admin control.",
      github: "https://github.com/mismark/BDU_Document_Request_Management_System",
      live: "#" // or real deployed link
    }
  ];

  return (
    <section id="projects" className="projects">
      <h2>Projects</h2>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={index} className="project-card">

            <h3>{project.title}</h3>
            <p>{project.desc}</p>

            <div className="buttons">
              {/* GitHub Link */}
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn github"
              >
                GitHub
              </a>

              {/* Live Demo Link */}
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="btn live"
              >
                Live Demo
              </a>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;