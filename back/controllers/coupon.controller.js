import Coupon from "../models/coupon.models.js";
import user from "../models/user.models.js";

export const getCoupon = async (req,res) => {
    try {
        const coupon = Coupon.find({userId:req.user._id,isActive:true});
        res.json(coupon || null)
    } catch (error) {
        console.log("Error in getCoupon Controller", error.message);
        return res.status(500).json({message: "Server error", error: error.message});
    }
};

export const validateCoupon = async (req,res) => {
    try {
        const {code} = req.body
        const coupon = await Coupon.findOne({code:code, userid:req.user._id, isActive:true});

        if (!coupon) {
            res.status(404).json({message: "Coupon not found"});

        } if (coupon.expirationDate < Date.now()) {
            res.status(400).json({message: "Coupon expired"});
            coupon.isActive = false
            await coupon.save();
        }


        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,

        })
    } catch (error) {
        console.log("Error in validateCoupon Controller", error.message);
        res.status(500).json({message: "server error", error: error.message})
    }
};