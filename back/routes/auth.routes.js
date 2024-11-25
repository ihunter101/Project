import express from "express"; //This line imports the express module, which is a web framework for
                              // Node.js that simplifies the process of handling HTTP requests and creating APIs.

import {signup, login, logout } from "../controllers/auth.controller.js"

const router = express.Router();

router.post("/signup", signup)

router.post("/login", login)

router.post("/logout", logout)
export default router //you are telling JavaScript: "Hey, if someone imports this file, send them the router object by default.