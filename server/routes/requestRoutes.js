const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const Request = require("../models/Request");
const User = require("../models/User");

// Send request
router.post("/send/:receiverId", protect, async (req, res) => {
    try {
        const { receiverId } = req.params;
        const { message } = req.body;

        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver user not found" });
        }

        const existingRequest = await Request.findOne({
            sender: req.user._id,
            receiver: receiverId,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        const request = await Request.create({
            sender: req.user._id,
            receiver: receiverId,
            message,
        });

        res.status(201).json({
            message: "Request sent successfully",
            request,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Incoming requests
router.get("/incoming", protect, async (req, res) => {
    try {
        const requests = await Request.find({
            receiver: req.user._id,
            status: "pending",
        }).populate("sender", "name email college branch year skills interests");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sent requests
router.get("/sent", protect, async (req, res) => {
    try {
        const requests = await Request.find({
            sender: req.user._id,
        }).populate("receiver", "name email college branch year skills interests");

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept request
router.put("/:id/accept", protect, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to accept this request" });
        }

        request.status = "accepted";
        await request.save();

        res.json({
            message: "Request accepted successfully",
            request,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reject request
router.put("/:id/reject", protect, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to reject this request" });
        }

        request.status = "rejected";
        await request.save();

        res.json({
            message: "Request rejected successfully",
            request,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;