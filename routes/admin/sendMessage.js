const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const userDB = require('../../model/userdb')
const axios = require('axios')

var AuthData = {
  key: process.env.sms_token,
  user_id: process.env.sms_user_id,
  number : process.env.sms_number
}

const sendSms = ( receiver, msg) => {
  return axios.post('https://apis.aligo.in/send/', null, {
      params: {
        key: AuthData.key,
        user_id: AuthData.user_id,
        sender: AuthData.number,
          receiver: receiver,
          title : 'Surxon Market Order Confirmation',
          msg: msg
      },
  }).then((res) => res.data).catch(err => {
      console.log('err', err);
  });
}

router.post('/send/message', Auth, async (req, res)=>{
  console.log(req.body.phone)
    await sendSms(req.body.phone, req.body.msg).then((result)=>{
      console.log(result)
      res.send(result)
    })

})

router.post('/send/all/message', Auth, async (req, res)=>{
    await userDB.find({}).then((data)=>{
      for(let i =0; i<data.length; i++){
        console.log(data[i])
        sendSms(data[i]['phone'], req.body.msg).then((result)=>{
          console.log(result)
          res.send(result)
        })
      }
    })
  })

module.exports = router 
