const express = require("express")
const passport = require("passport")
const userModel = require("../models/user")
const { createToken } = require("../utils/auth")
const mongoose = require("mongoose")

const router = express.Router()

router.get("/", async (req, res)=> res.send(await userModel.find({})))

router.post("/signUp", async(req, res)=> {
    try{
        const user = await userModel.register(req.body, req.body.password)
        const token = createToken({ username: user.username})
        res.send({
            access_token: token,
            user: user
        })
    }
    catch(exx){
        console.log(exx)
        res.status(500).send(exx)
    }
})

router.post("/login", passport.authenticate("local"), async (req, res) => {
    //create the token and return it
    const token = createToken({ username: req.user.username})
    res.send({
        access_token: token,
        user: req.user
    })
})

router.post("/refresh", passport.authenticate("jwt"), async (req, res)=>{
    const token = createToken({ username: req.user.username})
    res.send({
        access_token: token,
        user: req.user
    })
})

// router.post("/admin", passport.authenticate("jwt"), async (req, res)=>{
//     const update = await userModel.findOneAndUpdate({ _id: req.user._id }, { role: "Admin"})
//     res.send(update)
// })

router.put("/:userId", passport.authenticate("jwt"), async (req, res)=>{
    delete req.body.username
    delete req.body._id
    delete req.body.hash
    delete req.body.salt

    if (req.user._id.toString() !== req.params.userId && req.user.role !== "Admin")
        return res.status(401).send("cannot modify another user")
    else{
        const update = await userModel.findOneAndUpdate({ _id: req.params.userId }, req.body)
        res.send(update)
    }
})

module.exports = router