const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const Project = require("../models/Project");

// Create Project
router.post("/", protect, async (req, res) => {
    try {
        const { title, description, domain, requiredSkills, teamSize } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
            });
        }

        const project = await Project.create({
            title,
            description,
            domain,
            requiredSkills,
            teamSize,
            createdBy: req.user._id,
            members: [req.user._id],
        });

        res.status(201).json({
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Projects
router.get("/", protect, async (req, res) => {
    try {
        const { skill, domain } = req.query;

        let query = {
            status: "open",
        };

        if (skill) {
            query.requiredSkills = { $regex: skill, $options: "i" };
        }

        if (domain) {
            query.domain = { $regex: domain, $options: "i" };
        }

        const projects = await Project.find(query)
            .populate("createdBy", "name email college branch year")
            .populate("members", "name email");

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Single Project
router.get("/:id", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("createdBy", "name email college branch year skills")
            .populate("members", "name email skills");

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Project
router.put("/:id", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only project owner can update this project",
            });
        }

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.domain = req.body.domain || project.domain;
        project.requiredSkills = req.body.requiredSkills || project.requiredSkills;
        project.teamSize = req.body.teamSize || project.teamSize;
        project.status = req.body.status || project.status;

        const updatedProject = await project.save();

        res.json({
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Project
router.delete("/:id", protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only project owner can delete this project",
            });
        }

        await project.deleteOne();

        res.json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;