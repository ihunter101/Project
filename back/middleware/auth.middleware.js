import jwt from "jsonwebtoken";
import User from "../../models/user.models.js";

//protected route Controller
export const protectedRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized: Access token not found" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select(-"password");
        
            if(!user) {
                return res.status(401).json({message: "User Not found"})
            }
    
            req.user = user;
            next();
        
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized: Access token expired" });
            }
            throw error;
        }
    }   catch (error) {
        console.log( "Error in protectRoute middleware", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

//adminRoute Controller
export const adminRoute = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({message: "Unauthorized: Admin only"});
    }
    next();
};