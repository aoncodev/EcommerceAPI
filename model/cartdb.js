const mongoose = require('mongoose')
const {Schema}= mongoose;



const cartSchema = new Schema({
    _id : String,
	cart: Array
})

const cartDB = mongoose.model('cart', cartSchema)

module.exports = cartDB