const express = require('express')
const cartDB = require('../model/cartdb')
const router = express.Router()


router.post('/addCart', async (req, res) => {
    try {
        const phone = req.body.phone;
        const cartItem = req.body.cart;
  
        // Find the cart by phone number
        let existingCart = await cartDB.findOne({_id: phone})

        if(existingCart){
            let productExists = false;

            for (let i = 0; i < existingCart['cart'].length; i++){
                if (existingCart['cart'][i]['product_id'] == cartItem['product_id']){
                    let quantity = existingCart['cart'][i]['quantity'] + cartItem['quantity']
                    let price = cartItem['product_price'] * quantity
                    await cartDB.updateOne(
                        { _id: phone, 'cart.product_id': existingCart['cart'][i]['product_id'] },
                        { $set: { 'cart.$.quantity': quantity, 'cart.$.total': price } }
                    );
                    productExists = true;
                    break;
                }
            }

            if(!productExists) {
                await cartDB.updateOne({_id: phone}, {$push: {cart: cartItem}}, {upsert: true});
            }

            res.send({message: "done"});
        } else {
            // If the cart doesn't exist, create a new one
            const newCart = new cartDB({
                _id: phone,
                cart: [cartItem],
            });
  
            const saveResult = await newCart.save();
  
            if (saveResult) {
                res.send({ message: "done" });
            } else {
                res.send({ message: "error" });
            }
        }
    } catch (error) {
        res.send(error);
    }
});
  
  
  
  
  


router.get('/getCart/:id', async (req, res)=>{
    console.log(req.params.id)
    try {
        await cartDB.findOne({_id: req.params.id}).exec().then((cart)=>{
            if(cart){
                res.send(cart);
            }
            else{
                res.status(404).send('Not found');

            }
        })    
    } catch (error) {
        res.status(404).send('Not found');
    }
})


router.patch('/increaseCart', async (req, res)=>{
    const phone = req.body.phone
    const id = req.body.id
    
    if(phone != null && id != null){
        try {
            await cartDB.findOne({_id: phone}).then((cart)=>{
                if(cart){
                    let quantity = 0
                    let total = 0;
                    for (let i = 0; i< cart['cart'].length; i++){
                        if (cart['cart'][i]['product_id'] == id){
                            quantity = cart['cart'][i]['quantity']
                            quantity +=1
                            total = cart['cart'][i]['product_price'] * quantity
                        }
                    }
                    
                    
                    cartDB.updateOne({_id: phone, cart: {$elemMatch: {product_id: id}}}, {$set : {"cart.$.quantity": quantity, "cart.$.total": total}}).then((result)=>{
                        cartDB.findOne({_id: phone}).then((data)=>{
                            res.send(data)
                        })
                    })
                }
                else{
                    res.status(404).send('Not found');

                }
            })
        } catch (error) {
            res.status(404).send('Not found');

        }
    }
    else{
        res.status(404).send('Not found');
    }
})


router.patch('/decreaseCart', async (req, res)=>{
    const phone = req.body.phone
    const id = req.body.id
    if (phone != null && id != null){
    try {
        await cartDB.findOne({_id: phone}).then((cart)=>{
            if(cart){
                let quantity = 0
                let total = 0;
                let product_price = 0;
                for (let i = 0; i< cart['cart'].length; i++){
                    if (cart['cart'][i]['product_id'] == id){
                        quantity = cart['cart'][i]['quantity']
                        product_price = cart['cart'][i]['product_price']

                    }
                }
                if(quantity === 1){
                    res.status(404).send('Not found');
                }
                else{
                    quantity -=1
                    total = product_price * quantity
                    cartDB.updateOne({_id: phone, cart: {$elemMatch: {product_id: id}}}, {$set : {"cart.$.quantity": quantity, "cart.$.total": total}}).then((result)=>{
                        cartDB.findOne({_id: phone}).then((data)=>{
                            res.send(data)
                        })
                    })
                }
                
                
            }
            else{
                res.status(404).send('Not found');
            }
        })
    } catch (error) {
        res.status(404).send('Not found');
    }
}else{
    res.status(404).send('Not found');
}
    
})


router.patch('/deleteCart', async (req, res)=>{
    console.log(req.body)
    const phone = req.body.phone
    const id = req.body.id
    if(phone != null && id != null){
        try {
            await cartDB.findOne({_id: phone}).then((cart)=>{
                if(cart){
                    for (let i = 0; i< cart['cart'].length; i++){
                        if (cart['cart'][i]['product_id'] == id){
                            quantity = cart['cart'][i]['quantity']
                        }
                    }
                    cartDB.updateOne({_id: phone}, {$pull : {cart : {product_id: id}}}).then((result)=>{
                        cartDB.findOne({_id: phone}).then((data)=>{
                            res.send(data)
                        })
                    })
                }
                else{
                    res.status(404).send('Not found');
                }
            })
        } catch (error) {
            res.status(404).send('Not found');
        }
    }else{
        res.status(404).send('Not found');
    }
})



module.exports = router 