const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const userDB = require('../../model/userdb')


router.get('/users', Auth, async (req, res)=> {
    try {
        await userDB.find({}).then((result)=>{
            res.send(result)
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router 