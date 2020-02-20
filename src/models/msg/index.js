const mongoose = require("mongoose")

const message = new mongoose.Schema({
   from: String,
   to: String,
   message: String,
   date: Date
})


module.exports = mongoose.model("messages", message)