const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Get logged in user profile
router.get("/profile", protect, (req, res) => {
    res.json(req.user);
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.college = req.body.college || user.college;
        user.branch = req.body.branch || user.branch;
        user.year = req.body.year || user.year;
        user.skills = req.body.skills || user.skills;
        user.interests = req.body.interests || user.interests;
        user.bio = req.body.bio || user.bio;
        user.availability = req.body.availability || user.availability;
        user.github = req.body.github || user.github;
        user.linkedin = req.body.linkedin || user.linkedin;

        const updatedUser = await user.save();

        res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Find Partners
router.get("/partners", protect, async (req, res) => {
    try {
        const { skill } = req.query;

        let query = {
            _id: { $ne: req.user._id },
        };

        if (skill) {
            query.skills = { $regex: skill, $options: "i" };
        }

        const users = await User.find(query).select("-password");

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;