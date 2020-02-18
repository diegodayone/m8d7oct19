const express = require("express")
const passport = require("passport")
const userModel = require("../models/user")
const { createToken } = require("../utils/auth")

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

module.exports = router