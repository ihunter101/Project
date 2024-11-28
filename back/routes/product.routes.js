//back/routes/product.routes.js

import express from "express";
import {getAllProducts} from "../controllers/product.controller.js"
import {adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router();// this line creates a new router object and assigns it to the router variable.

router.get("/" , protectedRoute, adminRoute, getAllProducts); //this line adds a GET route to the router object that matches the root path ("/") 
                                //so that when a GET request is made to the root path, the getAllProducts function is called.

export default router