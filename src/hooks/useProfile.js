import { useState, useEffect } from "react";
import axios from "axios";

export const DEFAULT_PROFILE = {
  name:         "Mekuanint Misganaw",
  title:        "Full Stack Developer",
  bio:          "I am a dedicated third-year Information Systems student at Bahir Dar University with a strong passion for web development and modern technology.",
  email:        "mismarkol903@gmail.com",
  phone:        "",
  location:     "Bahir Dar, Ethiopia",
  photo:        "",
  cv:           "",
  github:       "https://github.com/mismark",
  linkedin:     "https://linkedin.com",
  telegram:     "https://t.me/mismarkol",
  instagram:    "https://instagram.com/mismarkol2121",
  extraSocials: [],
  heroTitles: [
    "Full Stack Developer",
    "React Developer",
    "Node.js Developer",
    "UI/UX Enthusiast",
  ],
  skills: [
    { name: "HTML",       level: 95 },
    { name: "CSS",        level: 88 },
    { name: "JavaScript", level: 85 },
    { name: "React",      level: 82 },
    { name: "Node.js",    level: 72 },
    { name: "PHP",        level: 70 },
    { name: "MySQL",      level: 75 },
    { name: "Python",     level: 65 },
    { name: "Java",       level: 60 },
    { name: "C++",        level: 55 },
    { name: "C#",         level: 50 },
    { name: "MongoDB",    level: 68 },
  ],
  stats: {
    yearsExperience:   1,
    projectsCompleted: 5,
    skillsCount:       12,
  },
};

function useProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    axios
      .get("/api/profile")
      .then((res) => {
        if (!cancelled && res.data?.data) {
          const d = res.data.data;
          setProfile({
            ...DEFAULT_PROFILE,
            ...d,
            extraSocials: d.extraSocials  ?? [],
            heroTitles:   d.heroTitles?.length ? d.heroTitles : DEFAULT_PROFILE.heroTitles,
            skills:       d.skills?.length     ? d.skills     : DEFAULT_PROFILE.skills,
            stats: { ...DEFAULT_PROFILE.stats, ...(d.stats ?? {}) },
          });
        }
      })
      .catch(() => { /* keep DEFAULT_PROFILE */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { profile, loading };
}

export default useProfile;
