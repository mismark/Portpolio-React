import { useEffect, useRef, useState } from "react";
import "./Stats.css";

function useCountUp(target, duration = 1600, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);

  return count;
}

function StatBox({ value, suffix, label, desc, animate }) {
  const count = useCountUp(value, 1400, animate);
  return (
    <div className="stat-box">
      <strong className="stat-value gradient-text">
        {animate ? count : 0}{suffix}
      </strong>
      <span className="stat-label">{label}</span>
      <span className="stat-desc">{desc}</span>
    </div>
  );
}

function Stats({ profile, loading: profileLoading }) {
  const sectionRef = useRef(null);
  const [animate, setAnimate] = useState(false);

  // Start count-up once profile has loaded AND the section is visible
  useEffect(() => {
    if (profileLoading) return;
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [profileLoading]);

  const stats = [
    {
      value:  profile?.stats?.yearsExperience   ?? 1,
      suffix: "+",
      label:  "Year Experience",
      desc:   "Working on real projects",
    },
    {
      value:  profile?.stats?.projectsCompleted ?? 5,
      suffix: "+",
      label:  "Projects Completed",
      desc:   "From idea to deployment",
    },
    {
      value:  profile?.stats?.skillsCount ?? 12,
      suffix: "+",
      label:  "Technologies",
      desc:   "Languages & frameworks",
    },
    {
      value:  100,
      suffix: "%",
      label:  "Commitment",
      desc:   "To every project",
    },
  ];

  return (
    <div className="stats-section" ref={sectionRef}>
      <div className="container">
        <div className="stats-grid">
          {stats.map((s) => (
            <StatBox key={s.label} {...s} animate={animate} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Stats;
