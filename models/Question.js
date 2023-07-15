const mongoose = require("mongoose");
const User = require("./user")
const questionSchema = new mongoose.Schema(
    {
        QuizName: {
            type: String,
            required: true,
        },
        question: {
            type: String,
            required: true,
        },
        option1: {
            type: String,
            required: true,
        },
        option2: {
            type: String,
            required: true,
        },
        option3: {
            type: String,
            required: true,
        },
        option4: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        }
    }
)
const Question = mongoose.model("Question", questionSchema)
module.exports = Question;