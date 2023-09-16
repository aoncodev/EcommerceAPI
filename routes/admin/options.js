const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const optionDB = require('../../model/optiondb')

router.post('/edit/shipping', Auth, async (req, res)=>{
    try {
        await optionDB.updateOne({_id: 1}, {$set: {shipping: req.body.price}}).then((data)=>{res.send(data)})    
    } catch (error) {
        res.send(error)
    }
    
})

router.post('/edit/bank/name', Auth, async (req, res)=>{
    try {
        await optionDB.updateOne({_id: 1}, {$set: {bank: req.body.bank}}).then((data)=>{res.send(data)})    
    } catch (error) {
        res.send(error)
    }
    
})

router.post('/edit/bank/number', Auth, async (req, res)=>{
    try {
        await optionDB.updateOne({_id: 1}, {$set: {bank_no: req.body.number}}).then((data)=>{res.send(data)})    
    } catch (error) {
        res.send(error)
    }
    
})

router.get('/options', Auth, async (req, res)=>{
    try {
        await optionDB.findOne({_id: 1}).then(data=> res.send(data))    
    } catch (error) {
        res.send(error)
    }
})

module.exports = router
