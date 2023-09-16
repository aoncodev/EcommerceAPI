const express = require('express')
const router = express.Router()
const productDB = require('../model/Productdb')
const categoryDB = require('../model/categorydb')


function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }


router.get('/product/:id', async (req, res)=>{
    await productDB.findById({_id: req.params.id}).exec().then((product)=>{
        res.send(product)
    })
})

router.get('/product', async (req, res)=>{
    await productDB.find({ avail: 1}).exec().then((product)=>{
        res.send(product)
    })
})



router.get('/category', async (req, res)=> {
    try {
        console.log('hdfkdsfl')
        await categoryDB.find().then((result)=>{
            console.log(result)
            res.send(result)
        })
    } catch (error) {
        res.status(404).send(error)
    }
})


router.get('/categories/:name', async (req, res)=>{
    try {
        await productDB.find({category_en: req.params.name, avail: 1}).then((result)=>{
            res.send(result);
        })
    } catch (error) {
        res.status(404).send(error)
    }
})


  




module.exports = router 