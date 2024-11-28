//back/controllers/product.controller.js
import Product from "../../models/product.models.js"
import redis from "../lib/redis.js"
import cloudinary from "../lib/cloudinary.js"
export const getAllProducts = async (req, res) => {
    try {
        const product = await Product.find();
        res.json({product});
        
    } catch (error) {
        console.log("Error in getAllProduct Controller", error.message);
        return res.status(500).json({message: "Server error", error: error.message });

    }
}
export const getFeaturedProducts = async (req, res) => {
    try {
       let featuredProducts =  await redis.get("featured_products");
        
       if (featuredProducts) {
        return res.json(JSON.parse(featuredProducts));
       }
       
       //if not in redis, get from mongodb
       featuredProducts = await Product.find({isFeatured: true}).lean();

       if (!featuredProducts) {
        return res.status(404).json({message: "No featured products found"});
       }

       //store in redis for future access
       await redis.set("featured_products", json.stringify(featuredProducts));
       res.json(featuredProducts);
    } catch (error) {
        console.log("Error in getFeaturedProducts Controller", error.message);
        return res.satus(500).json({message: "server error", error: error.message});

    }
}

export const createProduct = async (req, res) => {
    try {
        const {
            name, 
            price, 
            description,
            image, 
            category, 
            countInStock, 
            rating, 
            numReviews
        } = req.body;// this line destructures the name, price, description, image, category, countInStock, rating, and numReviews properties 
                    //from the req.body object and assigns them to variables with the same names.

        let cloudinaryResponse = null; //this sets the variable to null so in the case no image is provided, the code can still work later 

        if (image) { // if the image exist in the request body, it will be stored in cloudinary
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"});//stores the image in cloudinary and retrieves the image url
        }

        const product = await Product.create({// this line specifies the data feild for a product that will be stored in the mongoose database
            name,
            price,
            description,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : "", //if the cloudinary response is null, it will use an empty string for the img url
            category,
            countInStock,
            rating,
            numReviews
        });

        res.status(201).json(product);//this sends the newly created product object back to the client
    } catch (error) {
        console.log("Error in createProduct Controller", error.message);
        res.status(500).json({message: "Server error", error: error.message});
        }
    };
export default {getAllProducts}