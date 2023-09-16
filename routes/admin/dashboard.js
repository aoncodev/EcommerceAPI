const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const orderDB = require('../../model/orderdb')

router.get('/most/ordered', Auth, async (req, res)=> {
    try {
        console.log("he")
        const result = await orderDB.aggregate([
            { $group: {
                _id: "$user_id",  // Group by the user_id field
                username: { $first: "$receiver_name" },  // Get the first occurrence of the receiver_name (assuming it's the same for all orders of the same user)
                count: { $sum: 1 },  // Count the number of orders for each user
            }},
            { $project: {
                _id: 0,  // Exclude the _id field
                phone: "$_id",  // Rename the _id field to 'phone'
                username: 1,
                count: 1,
            }},
            { $sort: { count: -1 } }  // Sort by 'count' in descending order
        ]);

        res.send(result);
    } catch (error) {
        res.status(400).send({message: error});
    }
});


router.get('/recent/orders', Auth, async (req, res)=>{
    try {
        const allOrders = await orderDB.find({}, 'user_id receiver_name total _id date status');
        const recentOrders = allOrders.reverse().slice(0, 20);
        res.send(recentOrders);
    } catch (error) {
        res.send(error);
    }
});

router.get('/total/payment', Auth, async (req, res) => {
    try {
        const result = await orderDB.aggregate([
            { 
                $match: { status: "Delivered" }
            },
            { 
                $group: {
                    _id: "$payment_type",
                    total: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentType: "$_id",
                    total: 1
                }
            }
        ]);

        const total = result.reduce((accum, curr) => accum + curr.total, 0);

        const response = {
            directTotal: result.find(r => r.paymentType === "Direct Bank Transfer")?.total || 0,
            creditTotal: result.find(r => r.paymentType === "Card Payment")?.total || 0,
            total
        };

        res.send(response);

    } catch (error) {
        res.status(400).send({ message: error });
    }
});


module.exports = router;
