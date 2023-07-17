const mongoose = require("mongoose");
const scoreSchema = new mongoose.Schema(
    {
        QuizName: {
            type: String,
            required: true,
        },
        createdUser: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        score: {
            type: String,
            required: true,
        }
    }
)
const Score = mongoose.model("Score", scoreSchema)
module.exports = Score;