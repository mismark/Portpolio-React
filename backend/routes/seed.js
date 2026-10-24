const express  = require("express");
const router   = express.Router();
const Project  = require("../models/Project");

const DEFAULT_PROJECTS = [
  {
    title: "Amazon Delivery",
    description: "E-commerce delivery system with full cart functionality, product listing, and order management.",
    techStack: ["HTML", "CSS", "JavaScript"],
    github: "https://github.com/mismark/JavaScript-Amazon-Project",
    live: "https://amazon-online-shops.netlify.app/",
    featured: true,
    order: 1,
  },
  {
    title: "BDU Document System",
    description: "Document request management system with admin control, used at Bahir Dar University.",
    techStack: ["PHP", "MySQL", "HTML", "CSS"],
    github: "https://github.com/mismark/BDU_Document_Request_Management_System",
    live: "",
    featured: true,
    order: 2,
  },
  {
    title: "Car Rental System",
    description: "Car rental platform with vehicle listings, booking management, and admin dashboard.",
    techStack: ["PHP", "MySQL", "JavaScript"],
    github: "https://github.com/mismark/Car-Rental_System",
    live: "",
    featured: false,
    order: 3,
  },
  {
    title: "Portfolio by React",
    description: "Personal portfolio website built with React, featuring sections for projects, skills, and contact.",
    techStack: ["React", "CSS", "Vite"],
    github: "https://github.com/mismark/Portpolio-React",
    live: "https://portpolio-react-rho.vercel.app/",
    featured: true,
    order: 4,
  },
  {
    title: "Mini Projects Collection",
    description: "A collection of smaller projects and experiments including algorithms, UI components, and utilities.",
    techStack: ["JavaScript", "Python", "HTML"],
    github: "https://github.com/mismark",
    live: "",
    featured: false,
    order: 5,
  },
];

// POST /api/seed  — admin only (protect middleware applied in server.js)
router.post("/", async (req, res) => {
  try {
    const existing = await Project.countDocuments();
    if (existing > 0 && !req.body.force) {
      return res.json({
        success: false,
        message: `Database already has ${existing} projects. Pass force:true to overwrite.`,
      });
    }

    await Project.deleteMany();
    const inserted = await Project.insertMany(DEFAULT_PROJECTS);

    res.json({
      success: true,
      message: `Seeded ${inserted.length} projects successfully.`,
      count: inserted.length,
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ success: false, message: "Seed failed." });
  }
});

module.exports = router;
