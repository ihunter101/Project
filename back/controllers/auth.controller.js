import User from "../../models/user.models.js";
import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";
import { set } from "mongoose";

const generateToken = (userId) => {
    //generates access that expires in 15 minutes
     const accessToken  = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'15m'});
     //generates refresh token that expires in 7 days
     const refreshToken =jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn:'7d'});
    //returns access token and refresh token
     return {accessToken, refreshToken}
    } 

    //storing the refresh token in the database
    const storeRefreshToken = async(userId, refreshToken) => {
        await redis.set(`refresh token ${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7);// expires in 7 days
    }
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevents XSS attacks
        secure:process.env.NODE_ENV === "production",//only sends the cookie over HTTPS
        samesite: "strict", //prevents CRSF attacks 
        maxAge: 60 * 15 * 1000, //expires in 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //prevents XSS attacks
        secure:process.env.NODE_ENV === "production",//only sends the cookie over HTTPS
        samesite: "strict", //prevents CRSF attacks 
        maxAge: 7* 60 * 60 * 15 * 1000, //expires in 7 days
    });
}
export const signup = async (req, res) =>{
    const {name, email, password} = req.body
    const userExits = await User.findOne({email});

        try {
            //checks if a user exist
            if (userExits){
                return res.status(400).json({success: false, message: `This email ${email} already exists`});
            }
            //creates a new user
            const user = await User.create({name, email, password});

            const {accessToken, refreshToken} = generateToken(user._id);

            await storeRefreshToken(user._id, refreshToken);//stores the refresh token in the database

            setCookies(res, accessToken, refreshToken);
            //responds success
            res.status(201).json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }), 
            console.log('user created successfully');
        } catch (error) {
            //responds error
            console.log('error in signup controller', error.message);
            return res.status(500).json({success: false, message: error.message});
        }
    //res.send("sign up route called")
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Request body:", req.body);

        // Find the user by email and explicitly include the password field
        const user = await User.findOne({ email }).select('+password');
        console.log("User found:", user);

        if (user) {
            // Validate password
            const isPasswordValid = await user.comparePassword(password);
            console.log("Password valid:", isPasswordValid);

            if (isPasswordValid) {
                // Generate tokens
                const { accessToken, refreshToken } = generateToken(user._id);

                // Store the refresh token and set cookies
                await storeRefreshToken(user._id, refreshToken);
                setCookies(res, accessToken, refreshToken);

                console.log("User logged in successfully");
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                });
            }
        }

        // If user not found or password is invalid
        console.log("Invalid email or password");
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};



export const logout =async(req, res) => {
    const refreshToken = req.cookies.refreshToken;

    try {
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh token: ${decoded.userId}`) //deletes the refresh token from the database
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res.status(200).json({success: true, message: "Log out successfully"});
        }
    } catch (error) {
        res.status(500).json({message: 'server error', error: error.message});
    }
}