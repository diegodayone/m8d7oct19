const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    image: String,
    firstName: String,
    lastName: String,
    role: {
        type: String,
        default: "User"
    }
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("usersFromTheCloud", userSchema)