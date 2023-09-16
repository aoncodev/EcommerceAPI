const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const ads = require('../../model/Adsdb')
const AWS = require('aws-sdk')
const multer  = require('multer');
const upload = multer();

function makeid(length) {
    var result           = '';  
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_SECRET_KEY,
})


router.get('/ads', Auth, async (req, res)=>{
    try {
        await ads.find({}).then(data=> res.send(data.reverse()));
    } catch (error) {
        res.send(error)
    }
})

router.post('/add/ads', Auth, upload.any(), async (req, res)=>{
    try {
        const file = req.files[0];
        const { link } = req.body;
    
        let uniqueFileName = makeid(10) + file.originalname;
    
        // Set up parameters for S3 upload
        const uploadParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read'
        };
    
        // Upload image to S3
        const result = await s3.upload(uploadParams).promise();
    
        
        // Save to MongoDB
        const ad = new ads({
          _id: makeid(10),
          image: result.Location,
            link: link
        });
    
        await ad.save();
    
        res.send(ad);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
      }
    });

    router.post('/delete/ads', Auth, async (req, res)=>{
        try {
            const { id } = req.body;  // Assuming the id of category to delete is sent in the request body
            console.log(id)
            // Find the category first
            const category = await ads.findOne({ _id: id });
            console.log(category)
            if (category) {
                // Extract the S3 file key from the image URL
                const urlParts = category.image.split('/');
                const fileKey = urlParts[urlParts.length - 1];
                
                // Define S3 delete parameters
                const deleteParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: fileKey
                };
                
                // Delete the file from S3
                await s3.deleteObject(deleteParams);
                
                // Delete the category from MongoDB
                await ads.deleteOne({ _id: id });
                
                res.send({ message: 'ads deleted successfully.' });
            } else {
                res.send({ message: 'ads not found.' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    });


module.exports = router