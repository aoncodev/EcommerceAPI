const mongoose = require('mongoose')
const {Schema}= mongoose;





const UserSchema = new Schema({
    _id : String,
	phone: String,
    activation_code: Number,
    name: String,
    address : String,
    activated: {type: Boolean, default: false}
},{ versionKey: false })

UserSchema.static.isPhone = async function(phone){
    const user = await this.findOne({phone})
    try {
        if (user) return false
        return true
    } catch (error) {
        console.log(error)
    }

}

const UserDB = mongoose.model('user', UserSchema)

module.exports = UserDB