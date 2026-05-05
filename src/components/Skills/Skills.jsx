import "./Skills.css";
import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaPhp, FaJava, FaPython } from "react-icons/fa";

function Skills() {
  const skills = [
  { name: "HTML", icon: <FaHtml5 color="#e34c26" /> },
  { name: "CSS", icon: <FaCss3Alt color="#264de4" /> },
  { name: "JavaScript", icon: <FaJs color="#f0db4f" /> },
  { name: "React", icon: <FaReact color="#61DBFB" /> },
  { name: "PHP", icon: <FaPhp color="#777bb3" /> },
  { name: "Java", icon: <FaJava color="#f89820" /> },
  { name: "Python", icon: <FaPython color="#3776ab" /> }
];

  return (
    <section id="skills" className="section">
      <h2>Skills</h2>

      <div className="grid">
        {skills.map((skill, i) => (
          <div key={i} className="card">
            <div className="icon">{skill.icon}</div>
            <p>{skill.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;