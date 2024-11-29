//back/controllers/product.controller.js
import Product from "../models/product.models.js"
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

export const deletedProduct = async (req, res) => {
    try {
          // Find the product by ID
        const product = await Product.findById(req.params.id);

            // If product not found, return a 410 error
        if (!product) {
            return res.status(410).json({ message: "Product not found" });
        }
    
            // If the product has an image, attempt to delete it from Cloudinary
        if (product.image) {
            const imageId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${imageId}`);
                console.log("Deleted image from Cloudinary");
            } catch (error) {
                console.log("Error deleting image from Cloudinary", error);
            }
        }
    
        // Delete the product from the database
        await Product.findByIdAndDelete(req.params.id);
    
        // Send success response
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in deleting product controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
    
export const getRecommendedProducts = async (req, res)=> {
    try {
        const products = await Product.aggregate([
            {$sample: {size:4}},//$sample is an aggregation stage that randomly selects a 
                               //specified number of documents from the collection

            {$project: { // $project is an aggregation stage used to specify 
                        //which fields to include or exclude from the result.

                //the vallue 1 indicates that the field should be included in the result
                _id: 1,
                name: 1,
                price: 1, 
                description: 1,
                image: 1
            }}
        ]);

        res.json(products); 
    } catch (error) {
        console.log("Error in getRecommendedProducts Controller", error.message);
        res.status(500).json({message:"Server error", error: error.message});
    }
}

export const getProductByCategory = async (req, res) => {

    //get the category from the user's request 
    const {category} = req.params.category

    //find the category in the mongoose database and send the product object
    try {
        const product = await Product.find({category: category})
        res.json({product})
    } catch (error) {
        console.log("Error in getProductByCategory Controller", error.message)
        return res.status(500).json({message: "server error", error: error.message});
        
    }
}


export const toggleFeaturedProducts = async (req, res) => {
    const {id} = req.params.id 

    try {
        const product = await Product.findById(id);
         
        if (product) {
            product.isFeatured = !product.isFeatured;
            const updatedFeaturedProduct = await product.save();
            await updatedFeaturedProductCache();
            res.json(product);
        }
        } catch (error) {
        console.log("Error in toggleFeaturedProducts Controller", error.message);
        return res.status(500).json({message: "server error", error: error.message});
    }
}

async function updatedFeaturedProductCache() {
    try {
        //the lean function is used to return plain javascript object rather than the entrei mongoose doc
        const featuredProducts = await Product.find({isFeatured: true}).lean();
        
        //redis stores data as strings, so we need to convert it into a string before storing it
        await redis.set("featured_products", JSON.stringify(featuredProducts));//the set function is used to store data in the redis database
    } catch (error) {
        console.log("Error in updatedFeaturedProductCache Controller", error.message);
        return res.status(500).json({message: "server error", error: error.message});
    }
}
export default {getAllProducts}