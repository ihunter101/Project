// routes/auth.routes.js
import express from "express"; //This line imports the express module, which is a web framework for
                              // Node.js that simplifies the process of handling HTTP requests and creating APIs.

import {signup, login, logout, refreshToken} from "../controllers/auth.controller.js"

import {protectedRoute, adminRoute} from "../middleware/auth.middleware.js"

import {getAllProducts} from "../controllers/product.controller.js"

const router = express.Router();

router.post("/signup", signup)

router.post("/login", login)

router.post("/logout", logout)

router.post("/refresh-token", refreshToken)

router.post("/", protectedRoute, adminRoute, getAllProducts);
export default router //you are telling JavaScript: "Hey, if someone imports this file, send them the router object by default.