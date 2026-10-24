const express = require("express");
const Project = require("../models/Project");

// ─── Handlers (exported individually so server.js can attach protect middleware) ──

const getAll = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error("Projects getAll error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getOne = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const create = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0] });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const update = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const remove = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    res.json({ success: true, message: "Project deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAll, getOne, create, update, remove };
