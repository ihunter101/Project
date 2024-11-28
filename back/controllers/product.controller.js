//back/controllers/product.controller.js
import Product from "../../models/product.models.js"

export const getAllProducts = async (req, res) => {
    try {
        const product = await Product.find();
        res.json({product});
        
    } catch (error) {
        console.log("Error in getAllProduct Controller", error.message);
        return res.status(500).json({message: "Server error", error: error.message });

    }
}

export default {getAllProducts}