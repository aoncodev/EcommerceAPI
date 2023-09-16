const mongoose = require('mongoose')
require('mongoose-double')(mongoose);
const {Schema}= mongoose;
var SchemaTypes = mongoose.Schema.Types;
const productdbSchema = new Schema({
    _id : String,
	title_en : String,
	title_uz : String,
	title_ru : String,
	title_ko: String,
	price : {type: SchemaTypes.Double},
	fixed_price : SchemaTypes.Double,
	sale : SchemaTypes.Double,
	category_en : String,
	category_uz : String,
	category_ru : String,
	category_ko : String,
	origin: String,
	weight: String,
	unit: String,
	brand: String,
	avail : SchemaTypes.Double,
	images : Array,
})

const productDB = mongoose.model('products', productdbSchema)

module.exports = productDB