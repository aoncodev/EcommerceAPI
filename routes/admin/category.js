const express = require('express')
const Auth = require('../../middleware/auth')
const router = express.Router()
const productDB = require('../../model/Productdb')
const categoryDB = require('../../model/categorydb')

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

router.post('/delete/category', Auth, async (req, res)=>{
    try {
        const { id } = req.body;  // Assuming the id of category to delete is sent in the request body
        
        // Find the category first
        const category = await categoryDB.findOne({ _id: id });

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
            s3.deleteObject(deleteParams);
            
            // Delete the category from MongoDB
            await categoryDB.deleteOne({ _id: id });
            
            res.send({ message: 'Category deleted successfully.' });
        } else {
            res.send({ message: 'Category not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});



router.post('/add/category', Auth, upload.any(), async (req, res)=>{
    try {
        const file = req.files[0];
    
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
        const category = new categoryDB({
          _id: makeid(10),
          name_en: req.body.name_en,
          name_uz: req.body.name_uz,
          name_ru: req.body.name_ru,
          name_ko: req.body.name_ko,
          image: result.Location,
        });
    
        await category.save();
        await subcategoryDB.updateOne({_id: req.body.subcategory}, {$push: {'categories': category}})
        res.send(category);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
      }
})





module.exports = router;