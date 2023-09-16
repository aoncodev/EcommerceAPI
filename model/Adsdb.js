const mongoose = require('mongoose')
const {Schema}= mongoose;



const adSchema = new Schema({
    _id : String,
	image: String,
    link: String,
})

const adDB = mongoose.model('ads', adSchema)

module.exports = adDB