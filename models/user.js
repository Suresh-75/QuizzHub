const mongoose = require("mongoose");
const Question = require("./Question")
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema)
module.exports = User;