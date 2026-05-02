const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        domain: {
            type: String,
            default: "",
        },
        requiredSkills: {
            type: [String],
            default: [],
        },
        teamSize: {
            type: Number,
            default: 2,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        applications: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                message: {
                    type: String,
                    default: "",
                },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "rejected"],
                    default: "pending",
                },
            },
        ],
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);