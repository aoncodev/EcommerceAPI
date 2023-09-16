const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const orderDB = require('../../model/orderdb')


router.get('/orders', Auth, async (req, res)=>{
    try {
        const order = await orderDB.find({})
        const ord = order.reverse();
        res.send(ord)
    } catch (error) {
        res.send(error)
    }
})


router.get('/order/:id', Auth, async (req, res)=>{
    console.log(req.params.id)
    try {
        const order = await orderDB.findById({_id: req.params.id}).then((data)=>{
            res.status(200).send(data)
        })
    } catch (error) {
        res.send(error)
    }
})


router.put('/order/status', Auth, async (req, res) => {
    try {
        console.log(req.body)
        const { id, status } = req.body;
        const order = await orderDB.updateOne({_id: id},{$set: {status: status}})
        res.send(order)
    } catch (error) {
        res.send(error)
    }
    
  });
  


module.exports = router 