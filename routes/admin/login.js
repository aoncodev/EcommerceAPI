const express = require('express')
const AdminDB = require('../../model/AdminUser')
const Auth = require('../../middleware/auth')
const router = express.Router()
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

router.post('/login', async (req, res)=>{
    try {
        console.log(req.body.phone);
        console.log(req.body)
        const user = await AdminDB.findOne({phone: req.body.phone});
        if(user){
            // Compare the password
            bcrypt.compare(req.body.password, user.password, function(err, result) {
                if (result == true) {
                    const token = jwt.sign({ id: user.phone, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
                    res.status(200).json({ token , user });
                } else {
                    res.status(400).send({message: "Wrong password"})
                }
            });
        }
        else{
            res.status(400).send({message: "Wrong Phone number"});
        }
    } catch (error) {
        res.status(400).send({message: error});
    }
});

router.post('/register',  async (req, res)=>{
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new AdminDB({
            phone: req.body.phone,
            name: req.body.name,
            password: hashedPassword,
            role: req.body.role,
        });

        user.save().then((result)=>{
            res.send({message: "Successfully created", user: result});
        });
    } catch (error) {
        res.status(400).send(error);
    }
});


router.get('/admin/user', Auth, async (req, res)=>{
    try {
        await AdminDB.find({}).then((data)=>{
            res.send(data)
        })
    } catch (error) {
        res.send(error)
    }
})

module.exports = router 