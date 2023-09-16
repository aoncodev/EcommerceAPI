const mongoose = require('mongoose')
const {Schema}= mongoose;



const AdminSchema = new Schema({
	phone: String,
    name: String,
    password: String,
    role: String,
})

const AdminDB = mongoose.model('AdminUser', AdminSchema,'AdminUser')

module.exports = AdminDB