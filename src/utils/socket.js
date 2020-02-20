const { verifyToken } = require("./auth")
const Message = require("../models/msg")

module.exports = {
    configureIO: (io) => {
        io.on("connection", async socket => {
            socket.on("striveBroadcast", (payload) => {
                console.log(payload)
                socket.broadcast.emit("striveBroadcast", payload)
            })
        
            socket.on("disconnect", () => {
                const connectedUsers = []
                Object.keys(io.sockets.connected).forEach(socketKey => { //we are searching in the connected sockets
                    if (io.sockets.connected[socketKey].username)
                        connectedUsers.push(io.sockets.connected[socketKey].username)
                })
                console.log(connectedUsers)
        
                socket.broadcast.emit("login", {
                    newUser: "",
                    connectedUsers: connectedUsers
                })
            })
        
            socket.on("login", (payload) => {
                const username = verifyToken(payload.token);
                socket.username =  username// <== here we are setting the property!!!
                const connectedUsers = []
                Object.keys(io.sockets.connected).forEach(socketKey => { //we are searching in the connected sockets
                    if (io.sockets.connected[socketKey].username)
                        connectedUsers.push(io.sockets.connected[socketKey].username)
                })
        
                console.log("new user ", connectedUsers)
                socket.emit("login", {
                    newUser: username,
                    connectedUsers: connectedUsers
                })
                socket.broadcast.emit("login", {
                    newUser: username,
                    connectedUsers: connectedUsers
                })
            })
        
            socket.on("message", (payload) => {
                Object.keys(io.sockets.connected).forEach(socketKey => { //we are searching in the connected sockets
                    if (payload.to === io.sockets.connected[socketKey].username) { //the socket with the required user name
                        //when we find him, we deliver!
                        io.sockets.connected[socketKey].emit("message", { ...payload, from: socket.username })
                       
                    }
                })
                //here you can save the messages too
                console.log({
                    from: socket.username,
                    to: payload.to,
                    message: payload.message,
                    date: new Date()
                })
                Message.create({
                    from: socket.username,
                    to: payload.to,
                    message: payload.message,
                    date: new Date()
                })
            })
        })
    }
}