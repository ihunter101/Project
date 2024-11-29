//back/routes/product.routes.js

import express from "express";
import {
    getAllProducts, 
    getFeaturedProducts, 
    createdProducts, 
    deleteProducts,
    getRecommendedProducts,
    getProductByCategory,
    toggleFeaturedProducts
} from "../controllers/product.controller.js"
import {adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router();// this line creates a new router object and assigns it to the router variable.

router.get("/" , protectedRoute, adminRoute, getAllProducts); //this line adds a GET route to the router object that matches the root path ("/") 
                                                                //so that when a GET request is made to the root path, the getAllProducts function is called.

router.get("/featured", getFeaturedProducts)
router.get("/category:category", getProductByCategory)
router.get("/recommendations", getRecommendedProducts)

router.post("/", protectedRoute, adminRoute, createdProducts)
router.patch("/id", protectedRoute, adminRoute, toggleFeaturedProducts)
router.delete("/:id", protectedRoute, adminRoute, deleteProducts)


export default router