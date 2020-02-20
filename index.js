const express = require("express")
const { verifyToken } = require("./src/utils/auth")
const userRouter = require("./src/routes/userRouter")
const fileRouter = require("./src/routes/fileRouter")
const passport = require("passport")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const socketio = require("socket.io")
const http = require("http")

dotenv.config()

mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true}, err=> console.log(err || "Mongo connected"))

const app = express() //creating our web service
app.use(cors())
app.set("port", process.env.PORT || 8080)
const socketServer = http.createServer(app).listen(app.get("port")) //create the socketio server on the same port
const io = socketio(socketServer) //we are creating the element that will react to the messages
io.set('transports', ["websocket"])
io.on("connection", async socket => {
    socket.on("striveBroadcast", (payload) => {
        console.log(payload)
        socket.broadcast.emit("striveBroadcast", payload)
    })

    socket.on("login", (payload) => {
        const username = verifyToken(payload.token)
        socket.username = username; // <== here we are setting the property!!!
        socket.broadcast.emit("login", username)
    })

    socket.on("message", (payload) => {
        Object.keys(io.sockets.connected).forEach(socketKey => { //we are searching in the connected sockets
            if (payload.to === io.sockets.connected[socketKey].username) { //the socket with the required user name
                //when we find him, we deliver!
                io.sockets.connected[socketKey].emit("message", { ...payload, from: socket.username })
                //here you can save the messages too
            }
        })
    })
})
app.use(passport.initialize())

app.use(express.json())

app.use("/auth", userRouter)
//app.use("/blob", fileRouter)
app.get("/", (req, res)=> res.send("Hello, and welcome to our web service (VSCODE)"))

//app.listen(process.env.PORT || 8080,  () => console.log("server is listening, after deployment from VSCode!"))