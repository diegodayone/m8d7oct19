const express = require("express")
const passport = require("passport")
const userModel = require("../models/user")
const { createToken } = require("../utils/auth")
const mongoose = require("mongoose")

const multer = require('multer')
const MulterAzureStorage = require('multer-azure-storage')
const upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: process.env.AZURE_STORAGE,
    containerName: 'images',
    containerSecurity: 'blob'
  })
})

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

router.post("/uploadPicture", 
        passport.authenticate("jwt"), //check the token and set the user info into req.user
        upload.single("image"), //save the picture and set the pic info into req.file
        async (req, res) => {

    //save into the database the url
    await userModel.findByIdAndUpdate(req.user._id, {
        image: req.file.url
    })
    //return the url
    res.send(req.file.url)
})

module.exports = router