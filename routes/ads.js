const express = require('express')
const axios = require('axios')
const adDB = require('../model/Adsdb')
const router = express.Router()


var AuthData = {
  key: process.env.sms_token,
  user_id: process.env.sms_user_id,
  number : process.env.sms_number
}

router.get('/ads', async (req, res)=>{
    await adDB.find().exec().then((ad) =>{
        res.send(ad)
    })  
})



const sendSms = ( receiver, total) => {
  return axios.post('https://apis.aligo.in/send/', null, {
      params: {
        key: AuthData.key,
        user_id: AuthData.user_id,
        sender: AuthData.number,
          receiver: receiver,
          title : 'Surxon Market Order Confirmation',
          msg: `Hi!\nThis is to inform you that we received your order.\nPlease complete the payment by transferring the\ntotal amount: ${total} KRW\n\n288-910613-00000\nHana Bank (하나은행)\n\n*Please include your name or order number when paying for our reference.`
      },
  }).then((res) => res.data).catch(err => {
      console.log('err', err);
  });
}

router.post('/sendMessage', async (req, res)=>{
  console.log(req.body.phone)
    await sendSms(req.body.phone, req.body.total).then((result)=>{
      console.log(result)
      res.send(result)
    })

})

module.exports = router 