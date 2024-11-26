import express from "express"; 
//is a way of importing the Express module into your JavaScript file, allowing you to use it to build web servers 
//and handle HTTP requests.
import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js"


import { connectDB } from "./lib/db.js";

dotenv.config(); //reads the .env file and loads the variables into process.env

const app = express();

const PORT = process.env.PORT || 5000 //|| represents the "or" and is used here as a back up

app.use(express.json());//this is used to parse the JSON data that is sent to the server


app.use(cookieParser());

//authentication routes
app.use("/api/auth", authRoutes);


app.listen(PORT,() => {
    console.log("server is running on http://localhost:" + PORT)
    connectDB()
})

//