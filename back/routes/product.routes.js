import express from "express";

const router = express.Router();// this line creates a new router object and assigns it to the router variable.

router.get("/", getAllProducts); //this line adds a GET route to the router object that matches the root path ("/") 
                                //so that when a GET request is made to the root path, the getAllProducts function is called.

export default router