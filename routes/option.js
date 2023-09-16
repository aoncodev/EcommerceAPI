const express = require('express')
const optionDB = require('../model/optiondb')
const router = express.Router()



router.get('/option', async (req, res)=>{
    await optionDB.findOne({_id:1}).then((option) =>{
        res.send(option)
    })  
})



module.exports = router 