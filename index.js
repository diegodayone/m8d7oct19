const express = require("express")
const auth = require("./src/utils/auth")
const userRouter = require("./src/routes/userRouter")
const passport = require("passport")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true}, err=> console.log(err || "Mongo connected"))

const app = express()
app.use(passport.initialize())
app.use(cors())
app.use(express.json())

app.use("/auth", userRouter)


app.listen(process.env.PORT || 4001, () => console.log("server is listening!"))