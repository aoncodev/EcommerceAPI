const mongoose = require('mongoose')
const {Schema}= mongoose;



const OrderSchema = new Schema({
    _id : String,
    order_id: Number,
	user_id: String,
    date: String,
    address: String,
    receiver_name: String,
    receiver_phone: String,
    status: String,
    payment_type: String,
    shippingReq: String,
    total: Number,
    cart: Array,
}, {
    timestamps: true // Enable timestamps without customizing field names
  })

const OrderDB = mongoose.model('orders', OrderSchema)

module.exports = OrderDB