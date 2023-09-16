const mongoose = require('mongoose')
const {Schema}= mongoose;



const categorySchema = new Schema({
    _id : String,
	name_uz : String,
    name_en : String,
    name_ru : String,
    name_ko: String,
    products : Number,
    image: String,
})

const category = mongoose.model('category', categorySchema, 'category')

module.exports = category