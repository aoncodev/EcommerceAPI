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


router.post('/product', Auth, upload.any(), async (req, res) => {
    try {
         
        console.log(req.body)
        let images = []
        let uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                let uniqueFileName = makeid(10) + file.originalname;
                images.push(process.env.s3_base_url + uniqueFileName);

                const uploadParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: uniqueFileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read'
                };

                s3.upload(uploadParams, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        });

        Promise.all(uploadPromises)
            .then((uploadResults) => {
                // handle success, all uploads completed
                const product = new productDB({
                    _id: makeid(10),
                    title_en: req.body.title_en,
                    title_uz: req.body.title_uz,
                    title_ru: req.body.title_ru,
                    title_ko: req.body.title_ko,
                    price: req.body.price,
                    fixed_price: req.body.fixed_price,
                    sale: req.body.sale ? Number(Number(req.body.sale).toFixed(1)) : req.body.sale, // Check if sale exists and if it's a number, before calling toFixed
                    category_en: req.body.category_en,
                    category_uz: req.body.category_uz,
                    category_ru: req.body.category_ru,
                    category_ko: req.body.category_ko,
                    weight: req.body.weight,
                    unit: req.body.unit,
                    origin: req.body.origin,
                    brand: req.body.brand,
                    avail: req.body.avail,
                    images: images
                });
                product.save().then((data) => {
                    res.status(200).send(data)
                })
            })
            .catch((error) => {
                // handle error, at least one upload failed
                console.log("Error uploading data: ", error);
                res.status(400).send("Error uploading data");
            });

    } catch (error) {
        console.log(error)
        res.status(400).json({ message: error })
    }
})


router.delete('/delete/product/:productId', Auth, async (req, res) => {
    try {
        // Find the product by ID
        const product = await productDB.findById(req.params.productId);

        // If product does not exist, send an error
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }

        // Construct S3 delete parameters
        const deleteParams = {
            Bucket: process.env.BUCKET_NAME,
            Delete: {
                Objects: [],
            }
        };

        // Loop through each image in the product
        for (const imageUrl of product.images) {
            // Assuming that the imageUrl is a full URL, we need to extract just the file name
            // This assumes your s3 bucket URL does not have any subdirectories
            let imageName = imageUrl.replace(process.env.s3_base_url, '');
            deleteParams.Delete.Objects.push({Key: imageName});
        }

        // Delete images from S3
        s3.deleteObjects(deleteParams, function(err, data) {
            if (err) {
                console.log(err, err.stack); // An error occurred
                return res.status(500).json({message: "Error deleting images from S3"});
            } else {
                console.log(data); // successful response
            }
        });

        // Delete product from MongoDB
        await productDB.findByIdAndRemove(req.params.productId);

        // Send success response
        res.status(200).json({message: "Product and related images successfully deleted"});
    } catch (error) {
        // Handle any other errors
        console.log(error)
        res.status(500).json({message: "An error occurred while deleting the product"});
    }
});


router.get('/products/:id', Auth, async (req, res)=>{
    console.log(req.params.id);
    try {
        if(req.params.id === 'all'){
            const products = await productDB.find({});
            const p = products.reverse()
            res.status(200).send(p)
        } else {
            const products = await productDB.find({category_en: req.params.id});
            const p = products.reverse()
            res.status(200).send(p)
        }
        
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get('/category', Auth, async (req, res)=>{
    try {
        const category = await categoryDB.find({});
        res.status(200).send(category)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get('/products/category/:id', Auth, async (req, res) => {
    try {
        const category = await productDB.find({ category_en: req.params.id });
        res.status(200).send(category)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/product/:id', Auth, async (req, res) => {
    try {
        const prod = await productDB.findOne({ _id: req.params.id });
        res.status(200).send(prod)
    } catch (error) {
        res.status(400).send(error)
    }
})


router.get('/products/avail/:id', Auth, async (req, res) => {
    try {
        const product = await productDB.findOne({_id: req.params.id});
        if(product.avail == 0.0){
            await productDB.updateOne({_id: req.params.id},{$set: { avail: 1}})
        } else if (product.avail == 1.0) {
            await productDB.updateOne({_id: req.params.id},{$set: { avail: 0}})
        }
        res.status(200).json({message: "updated"})
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

router.post('/edit/image', Auth, upload.any(), async (req, res) => {
    try {
        console.log(req.files);
        console.log(req.body);

        let file = req.files[0];  // Assuming you are sending only one file at a time.
        let productId = req.body.id; // get product id from the request body

        // Get image index from fieldname
        let imageIndex = parseInt(file.fieldname.replace('img', '')) - 1; // returns 0 for 'img1', 1 for 'img2' and so forth.

        // Unique file name for S3
        let uniqueFileName = makeid(10) + file.originalname;

        // Set up parameters for S3 upload
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: uniqueFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        // Upload to S3
        s3.upload(uploadParams, (err, data) => {
            if (err) {
                res.send(err);
            } else {
                // The new image URL
                let newImageUrl = process.env.s3_base_url + uniqueFileName;

                // Update the specific product document in MongoDB
                productDB.findById(productId, function (err, product) {
                    if (err) {
                        res.send(err);
                    } else {
                        // Get the key of the old image to delete
                        let oldImageUrl = product.images[imageIndex];
                        let oldImageKey = oldImageUrl.replace(process.env.s3_base_url, '');

                        // Replace the image URL at the specific index
                        product.images[imageIndex] = newImageUrl;

                        // Save the updated document
                        product.save(function (err) {
                            if (err) {
                                res.send(err);
                            } else {
                                // Delete the old image from S3
                                var deleteParams = {
                                    Bucket: process.env.BUCKET_NAME,
                                    Key: oldImageKey
                                };

                                s3.deleteObject(deleteParams, function(err, data) {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        res.send({ message: 'Image updated successfully' });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        res.send(error);
    }
});

router.post('/update/product/title_en', Auth, async (req,res)=>{
    try {
        console.log(req.body)
        const { id, title_en } = req.body; // Destructure id and title_en from request body
        
        // Update the specific product document in MongoDB
        productDB.findByIdAndUpdate(
            id,
            { title_en: title_en },
            { new: true }, // This option returns the updated document
            function (err, product) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({ message: 'Title updated successfully', product });
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/update/product/title_uz', Auth, async (req,res)=>{
    try {
        console.log(req.body)
        const { id, title_uz } = req.body; // Destructure id and title_en from request body
        
        // Update the specific product document in MongoDB
        productDB.findByIdAndUpdate(
            id,
            { title_uz: title_uz },
            { new: true }, // This option returns the updated document
            function (err, product) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({ message: 'Title updated successfully', product });
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
})


router.post('/update/product/title_ru', Auth, async (req,res)=>{
    try {
        console.log(req.body)
        const { id, title_ru } = req.body; // Destructure id and title_en from request body
        
        // Update the specific product document in MongoDB
        productDB.findByIdAndUpdate(
            id,
            { title_ru: title_ru },
            { new: true }, // This option returns the updated document
            function (err, product) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({ message: 'Title updated successfully', product });
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/update/product/title_ko', Auth, async (req,res)=>{
    try {
        console.log(req.body)
        const { id, title_ko } = req.body; // Destructure id and title_en from request body
        
        // Update the specific product document in MongoDB
        productDB.findByIdAndUpdate(
            id,
            { title_ko: title_ko },
            { new: true }, // This option returns the updated document
            function (err, product) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({ message: 'Title updated successfully', product });
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/update/product/price', Auth, async (req, res) => {
    const { id, price, fixed_price, sale } = req.body;
    console.log(req.body)
    try {
      let product = await productDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Update product details
      product.price = price;
      product.fixed_price = fixed_price;
      product.sale = Number(sale.toFixed(1)); 
  
      await product.save();
  
      return res.json({
        message: 'Product price, fixed price, and sale updated successfully.',
        product: product
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  });


  router.post('/update/product/avail', Auth, async (req, res) => {
    const { id, avail } = req.body;
    console.log(req.body)
    try {
      let product = await productDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Update product details
      product.avail = avail;
      
      await product.save();
  
      return res.json({
        message: 'Product price, fixed price, and sale updated successfully.',
        product: product
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  });

  router.post('/update/product/inSale', Auth, async (req, res) => {
    const { id, inSale } = req.body;
    console.log(req.body)
    try {
      let product = await productDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Update product details
      product.inSale = inSale;
      
      await product.save();
  
      return res.json({
        message: 'Product price, fixed price, and sale updated successfully.',
        product: product
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  });

  router.post('/update/product/inNew', Auth, async (req, res) => {
    const { id, inNew } = req.body;
    console.log(req.body)
    try {
      let product = await productDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Update product details
      product.inNew = inNew;
      
      await product.save();
  
      return res.json({
        message: 'Product price, fixed price, and sale updated successfully.',
        product: product
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  });

  router.post('/update/product/inBest', Auth, async (req, res) => {
    const { id, inBest } = req.body;
    console.log(req.body)
    try {
      let product = await productDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Update product details
      product.inBest = inBest;
      
      await product.save();
  
      return res.json({
        message: 'Product price, fixed price, and sale updated successfully.',
        product: product
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  });

  router.post('/update/product/inFeatured', Auth, async (req, res) => {
    const { id, inFeatured } = req.body;
    console.log(req.body)
    try {
      let product = await productDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }
  
      // Update product details
      product.inFeatured = inFeatured;
      
      await product.save();
  
      return res.json({
        message: 'Product price, fixed price, and sale updated successfully.',
        product: product
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error.' });
    }
  });

module.exports = router



