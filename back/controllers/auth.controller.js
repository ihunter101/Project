import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";

// Generate Access and Refresh Tokens
const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { 
        expiresIn: "15m" 
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn: "7d",
     });
    return { accessToken, refreshToken };
};

// Store Refresh Token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60 ); // expires in 7 days
};

// Set Cookies for Access and Refresh Tokens
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 60 * 15 * 1000, // Expires in 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // Expires in 7 days
    });
};

// Sign Up Controller
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: `This email ${email} already exists` });
        }

        // Create new user
        const user = await User.create({ name, email, password });

        // Generate tokens
        const { accessToken, refreshToken } = generateToken(user._id);

        // Store refresh token in Redis
        await storeRefreshToken(user._id, refreshToken);

        // Set cookies
        setCookies(res, accessToken, refreshToken);

        // Respond with user data
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in signup controller:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Login Controller
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email and include password field
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateToken(user._id);

        // Store refresh token in Redis
        await storeRefreshToken(user._id, refreshToken);

        // Set cookies
        setCookies(res, accessToken, refreshToken);

        // Respond with user data
        return res.json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in login controller:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Logout Controller
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const redisKey = `refresh_token:${decoded.userId}`;
            await redis.del(redisKey); // Delete refresh token from Redis

            // Clear cookies
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");

            return res.status(200).json({ success: true, message: "Logged out successfully" });
        }
        return res.status(400).json({ success: false, message: "Refresh token not found" });
    } catch (error) {
        console.error("Error during logout:", error.message);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Refresh Access Token Controller
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(410).json({ message: "Refresh token not found" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const redisKey = `refresh_token:${decoded.userId}`;
        const storedToken = await redis.get(redisKey);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Unauthorized: Token mismatch" });
        }

        // Generate new access token
        const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        // Set new access token in cookies
        res.cookie("newAccessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return res.status(200).json({ message: "Access token refreshed successfully" });
    } catch (error) {
        console.error("Error refreshing token:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
