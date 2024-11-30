import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a code'],
        unique: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100    
    },
    expirationDate: {
        type: Date,
        required: true
    }, 
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
},
{
    timestamps: true
}
);

const coupon =mongoose.model("Coupon", couponSchema);

export default coupon;