import "./About.css";

function About() {
  return (
    <section id="about" className="about">

      <h2>About Me</h2>

      <p>
        I am a dedicated third-year Information Systems student at Bahir Dar University with a strong passion for web development and modern technology. I enjoy building responsive and user-friendly web applications that solve real-world problems. My focus is on full stack development, where I work with both frontend and backend technologies. I have hands-on experience with HTML, CSS, JavaScript, React, PHP, and MySQL. I am comfortable designing clean user interfaces and implementing functional backend systems. I enjoy turning ideas into real, working digital products. Through my academic and personal projects, I have developed problem-solving and critical thinking skills. I am always eager to learn new technologies and improve my development skills. I pay attention to detail and aim to write clean, maintainable code. I also have experience using Git and GitHub for version control and collaboration. Working on projects has helped me understand real-world development workflows. I am highly motivated, disciplined, and committed to continuous growth. I enjoy collaborating with others and learning from experienced developers. My goal is to become a professional developer who builds impactful and scalable systems. I am currently looking for opportunities where I can apply my skills and gain real-world experience through internships.
      </p>

      {/* DOWNLOAD CV BUTTON */}
      <a
        href="/files/Mekuanint-CV.pdf"
        download
        className="cv-btn"
      >
        ⬇ Download CV
      </a>

    </section>
  );
}

export default About;