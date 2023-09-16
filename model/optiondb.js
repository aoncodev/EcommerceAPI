const mongoose = require('mongoose')
const {Schema}= mongoose;



const optionSchema = new Schema({
    _id : Number,
    shipping: Number,
    bonus: Number,
    bank: String,
    bank_no: String,
    shipping_policy_en: String,
    shipping_policy_ru: String,
    shipping_policy_uz: String,
    shipping_policy_ko: String,
})

const optionDB = mongoose.model('option', optionSchema, 'option')

module.exports = optionDB