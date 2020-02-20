const express = require("express")

const userRouter = require("./src/routes/userRouter")
const fileRouter = require("./src/routes/fileRouter")
const passport = require("passport")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const socketio = require("socket.io")
const http = require("http")
const Message = require("./src/models/msg")
const messageRouter = require("./src/routes/messageRouter")
const { configureIO } = require("./src/utils/socket")

dotenv.config()

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true}, err=> console.log(err || "Mongo connected"))

const app = express() //creating our web service
app.use(cors())
app.set("port", process.env.PORT || 8080)
const socketServer = http.createServer(app).listen(app.get("port")) //create the socketio server on the same port
const io = socketio(socketServer) //we are creating the element that will react to the messages
io.set('transports', ["websocket"])
configureIO(io);

app.use(passport.initialize())

app.use(express.json())

app.use("/auth", userRouter)//app.use("/blob", fileRouter)
app.use("/message", messageRouter)
app.get("/", (req, res)=> res.send("Hello, and welcome to our web service (VSCODE)"))

//app.listen(process.env.PORT || 8080,  () => console.log("server is listening, after deployment from VSCode!"))