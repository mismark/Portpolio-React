/**
 * Seed script — populates MongoDB with initial project data.
 * Run once with: node seed.js
 */
require("dotenv").config();
const connectDB = require("./db");
const Project = require("./models/Project");

const projects = [
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

const seed = async () => {
  await connectDB();
  await Project.deleteMany();
  await Project.insertMany(projects);
  console.log("✅ Projects seeded successfully.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
