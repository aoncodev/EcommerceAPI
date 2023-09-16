const express = require('express')
const userDB = require('../model/userdb')
const router = express.Router()
const aligoapi = require('aligoapi');
const axios = require('axios');



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


var AuthData = {
    key: process.env.sms_token,
    user_id: process.env.sms_user_id,
    number : process.env.sms_number
  }



Math.floor(100000 + Math.random() * 900000)

router.post('/createUser', async (req, res)=>{
    try {
        if(req.body.phone == "01012345678"){
            await userDB.findOne({phone: req.body.phone}).then((result)=>{
                res.send(result)
            })
        }else {
        await userDB.findOne({phone: req.body.phone}).then((result)=>{
            if(result){
                let activation = Math.floor(100000 + Math.random() * 900000)
                userDB.updateOne({phone: req.body.phone}, {activation_code: activation}, {upsert: true}).then((result)=>{
                    const data = userDB.findOne({phone: req.body.phone}).then((result)=>  {
                        const sms =  axios.post('https://apis.aligo.in/send/', null, {
                            params: {
                                key: AuthData.key,
                                user_id: AuthData.user_id,
                                sender: AuthData.number,
                                receiver: req.body.phone,
                                msg: `Surxon Market\nYour Verification code is [${activation}]`, 
                                msg_type : 'SMS',
                                title : 'Verification Code',
                                
                            },
                        }).then((sms_verify)=>{
                            console.log(sms_verify)
                            res.send(result);
                        }).catch((e)=>{
                            res.status(404).send('Error')
                        })
                    })
                })
                
            }else{
                let activation = Math.floor(100000 + Math.random() * 900000)
                const user = new userDB({
                    _id: makeid(20),
                    phone: req.body.phone,
                    address: "",
                    activation_code: activation
                })
                user.save().then(result => {
                    const sms =  axios.post('https://apis.aligo.in/send/', null, {
                            params: {
                                key: AuthData.key,
                                user_id: AuthData.user_id,
                                sender: AuthData.number,
                                receiver: req.body.phone,
                                msg: `Surxon Market\nYour Verification code is [${activation}]`, 
                                msg_type : 'SMS',
                                title : 'Verification Code',
                                
                            },
                        }).then((sms_verify)=>{
                            console.log(sms_verify)
                            res.send(result);
                        }).catch((e)=>{
                            res.status(404).send('Error')
                        })
                })   
                }
        })}
        
    } catch (error) {
        res.send(error);
    }
    
})

router.post('/verifyUser', async (req, res)=>{
    try {
        console.log(req.body)
        await userDB.findOne({phone: req.body.phone}).then((result)=>{
            if(result.activation_code == req.body.code){
                userDB.updateOne({phone: req.body.phone}, {activated: true}, {upsert: true}).then((result)=>{
                    const data = userDB.findOne({phone: req.body.phone}).then((result)=>{
                        res.send(result)
                    })
                })
            }
            else{
                res.send({message: "Wrong Phone number"})
            }
        })
    } catch (error) {
        res.send({message: "Error"})
    }

})


router.get('/getUser/:id', async (req, res)=>{
    const phone_num = req.params.id 
    console.log(phone_num)
    try {
        await userDB.findOne({phone: phone_num}).then((data)=>{
            res.send(data)
        })
    } catch (error) {
        res.status(404).send('Not found')
    }
})


router.patch('/addAddress', async (req, res)=>{
    try {
        const id = req.body.id
        let address_data = req.body.address
        address_data.address_id = makeid(10)
        console.log(address_data)
        await userDB.findOne({phone: id}).then((result)=>{
            if(result){
                userDB.updateOne({phone: id}, {$push: {address: address_data}}).then((data)=>{
                    res.send(data);
                })
            }
            else{
                res.status(404).send('Not found')
            }
        })
        
    } catch (error) {
        res.status(404).send(error)
    }

})

router.patch('/removeAddress', async (req, res)=>{
    try {
        const id = req.body.id
        const address_id = req.body.address_id
        await userDB.findOne({phone: id}).then((result)=>{
            if(result){
                userDB.updateOne({phone: id}, {$pull: {address: {address_id: address_id}}}).then((data)=>{
                    userDB.findOne({phone: id}).then((result)=>{
                        res.send(result)
                    })
                })
            }
            else{
                res.status(404).send('Not found')
            }
        })   
    } catch (error) {
        res.status(404).send(error)
    }
})

router.post('/update/user', async (req, res)=>{
    try {
        await userDB.findOne({phone: req.body.user_id}).then((result)=>{
            if(result){
                userDB.updateOne({phone: req.body.user_id}, {$set: {address: [{
                    name: req.body.name,
                    phone: req.body.phone,
                    address: req.body.address,
                    type: req.body.type,
                    address_id: req.body.address_id
                }]}} ).then((result)=>{
                    const data = userDB.findOne({phone: req.body.user_id}).then((result)=>{
                        res.send(result)
                    })
                })
            }
            else{
                res.send({message: "Wrong Phone number check"})
            }
        })
    } catch (error) {
        res.send({message: "Error"})
    }
})



router.post('/user/update/address',  async (req, res)=>{
    console.log(req.body)
    try {
        await userDB.updateOne({phone: req.body.phone}, {$set: {address: req.body.address, name: req.body.name}}).then(result=>{
            res.send(result)
        })        
    } catch (error) {
        res.send(error)
    }
})


module.exports = router 