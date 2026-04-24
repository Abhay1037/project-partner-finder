const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/test", (req, res) => {
    res.json({
        message: "Data Received",
        data: req.body,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});