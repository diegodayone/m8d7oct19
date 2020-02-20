const LocalStrategy = require("passport-local").Strategy
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const passport = require("passport")
const jwt = require("jsonwebtoken")
const UserModel = require("../models/user")
const dotenv = require("dotenv")

dotenv.config()

passport.serializeUser(UserModel.serializeUser())
passport.deserializeUser(UserModel.deserializeUser())

passport.use(new LocalStrategy(UserModel.authenticate()))

passport.use(new JwtStrategy({
    secretOrKey: process.env.KEY,
    jwtFromRequest:  ExtractJwt.fromAuthHeaderAsBearerToken()
}, (jsonWebToken, callback)=>{
    UserModel.findOne({ username: jsonWebToken.username }, (err, user)=>{
        if (err) return callback(err)
        else if (user) return callback(null, user)
        else return callback(null, false)
    })
} ))

module.exports = {
    createToken: (userInfo) => jwt.sign(userInfo, process.env.KEY, { expiresIn: 3600 * 24 }),
    verifyToken: (token) => jwt.verify(token, process.env.KEY).username
}