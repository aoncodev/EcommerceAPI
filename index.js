require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')



mongoose.connect(process.env.DB_URL, {
    authSource: "admin",
    user: process.env.db_user,
    pass: process.env.db_pass
}).then(()=>{
    console.log("Db connected!")
})


app.use(express.json())
app.use(cors())
app.use('/api', require('./routes/newProduct'))
app.use('/api', require('./routes/ads'))
app.use('/api', require('./routes/user'))
app.use('/api', require('./routes/cart'))
app.use('/api', require('./routes/order'))
app.use('/api', require('./routes/option'))






app.use('/admin', require('./routes/admin/login'))
app.use('/admin', require('./routes/admin/dashboard'))
app.use('/admin', require('./routes/admin/users'))
app.use('/admin', require('./routes/admin/products'))
app.use('/admin', require('./routes/admin/category'))
app.use('/admin', require('./routes/admin/orders'))
app.use('/admin', require('./routes/admin/options'))
app.use('/admin', require('./routes/admin/ads'))
app.use('/admin', require('./routes/admin/sendMessage'))


app.get('/', (req, res)=>{
    res.send("Hello world")
})

app.listen(3000, () => {
    console.log(`Example app listening at http://localhost:3000`)
  })