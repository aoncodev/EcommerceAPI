const express = require('express')
const orderDB = require('../model/orderdb')
const cartDB = require('../model/cartdb')
const router = express.Router()
const axios = require('axios')

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}





router.post('/makeOrder', async (req, res)=>{
    try {
        await orderDB.find({}).then((data)=>{
            orderLength = data.length
            new_order_id = orderLength + 1 + 200000
            console.log(orderLength)
            const order = orderDB({
                _id : makeid(6),
                order_id: new_order_id,
                user_id: req.body.user_id,
                date: req.body.date,
                address: req.body.address,
                receiver_name: req.body.receiver_name,
                receiver_phone: req.body.user_id,
                status: req.body.status,
                payment_type: req.body.payment_type,
                shippingReq: req.body.shippingReq,
                total: req.body.total,
                cart: req.body.cart,
            })
            order.save().then((result)=>{
                cartDB.updateOne({"_id": req.body.user_id}, {$set : {cart: []}}).then((result)=>{
                    message_bot = `New Order ID:${new_order_id}\nTEL: ${req.body.user_id}\nName: ${req.body.receiver_name}`
                    let botMessage = axios.get(`https://api.telegram.org/bot${process.env.telegram_token}/sendMessage?chat_id=-4088582085&parse_mode=Markdown&text=${message_bot}`)
                    res.send(result)
                })
            })
    })
    } catch (error) {
        res.send({message: "Error"})
    }

})


router.get('/getOrder/:user_id', async (req, res)=>{
    try {
        await orderDB.find({user_id: req.params.user_id}).then((data)=>{
            res.send(data.reverse())
        })
    } catch (error) {
        res.status(404).send({message: "Error"})
    }
})

router.get('/order/:order_id', async (req, res)=>{
    console.log(req.params.order_id)
    try {
        await orderDB.findOne({order_id: req.params.order_id}).then((data)=>{
            res.send(data)
        })
    } catch (error) {
        res.status(404).send({message: "Error"})
    }
})

module.exports = router 