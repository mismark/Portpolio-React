import "./Skills.css";
import {
  FaHtml5, FaCss3Alt, FaJs, FaReact,
  FaPhp, FaJava, FaPython, FaNodeJs, FaDatabase,
} from "react-icons/fa";
import {
  SiMongodb, SiMysql, SiCplusplus, SiTypescript,
  SiTailwindcss, SiFirebase, SiExpress, SiDotnet,
} from "react-icons/si";
import useScrollReveal from "../../hooks/useScrollReveal";

// Maps skill name → { icon, color }
// Level now comes from the database, not from here.
const SKILL_META = {
  "html":        { icon: <FaHtml5 />,      color: "#e34c26" },
  "html5":       { icon: <FaHtml5 />,      color: "#e34c26" },
  "css":         { icon: <FaCss3Alt />,     color: "#264de4" },
  "css3":        { icon: <FaCss3Alt />,     color: "#264de4" },
  "javascript":  { icon: <FaJs />,          color: "#f0db4f" },
  "js":          { icon: <FaJs />,          color: "#f0db4f" },
  "typescript":  { icon: <SiTypescript />,  color: "#3178c6" },
  "react":       { icon: <FaReact />,       color: "#61dbfb" },
  "node.js":     { icon: <FaNodeJs />,      color: "#68a063" },
  "nodejs":      { icon: <FaNodeJs />,      color: "#68a063" },
  "express":     { icon: <SiExpress />,     color: "#ffffff" },
  "expressjs":   { icon: <SiExpress />,     color: "#ffffff" },
  "php":         { icon: <FaPhp />,         color: "#777bb3" },
  "python":      { icon: <FaPython />,      color: "#3776ab" },
  "java":        { icon: <FaJava />,        color: "#f89820" },
  "mongodb":     { icon: <SiMongodb />,     color: "#4db33d" },
  "mysql":       { icon: <SiMysql />,       color: "#00758f" },
  "c++":         { icon: <SiCplusplus />,   color: "#00599c" },
  "c#":          { icon: <SiDotnet />,      color: "#68217a" },
  "sql":         { icon: <FaDatabase />,    color: "#f48024" },
  "tailwind":    { icon: <SiTailwindcss />, color: "#38bdf8" },
  "tailwindcss": { icon: <SiTailwindcss />, color: "#38bdf8" },
  "firebase":    { icon: <SiFirebase />,    color: "#ffca28" },
};

const FALLBACK_META = { icon: <FaDatabase />, color: "#6366f1" };

function Skills({ profile }) {
  const revealTitle = useScrollReveal();
  const rawSkills = profile?.skills;

  // skills is now [{name, level}] — fall back to defaults if empty
  const skills = (rawSkills?.length ? rawSkills : [
    { name: "HTML",       level: 95 }, { name: "CSS",        level: 88 },
    { name: "JavaScript", level: 85 }, { name: "React",      level: 82 },
    { name: "Node.js",    level: 72 }, { name: "MongoDB",    level: 68 },
  ]).map((s) => {
    const meta = SKILL_META[s.name?.toLowerCase()] ?? FALLBACK_META;
    return { name: s.name, level: s.level ?? 70, ...meta };
  });

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <h2 className="section-title reveal fade-up" ref={revealTitle}>Skills &amp; Technologies</h2>
        <p className="section-subtitle">Technologies I work with regularly</p>

        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-card">
              <div className="skill-header">
                <span className="skill-icon" style={{ color: skill.color }}>
                  {skill.icon}
                </span>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percent">{skill.level}%</span>
              </div>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{
                    width: `${skill.level}%`,
                    background: `linear-gradient(90deg, ${skill.color}99, ${skill.color})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
