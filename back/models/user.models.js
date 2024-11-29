import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name'],
        trim : true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        match: [// this feild is used to validate the email
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be up to 6 characters'], 
        select: false
    }, 
    cartItems: [
        {// this field stores the cart items of the user
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {// this field is used to store the price of the product
            type: Number,
            required: true,
            default: 0
        },
        product: {// this field is used to store the id of the product
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true
            }
        }
    ],
    role: {//this field is used to store the role of the user:
         type: String,
         enum: ['customer', 'admin'],
        default: 'customer'
        }, 
       
    },{ 
    timestamps: true //creates createdAt and updatedAt fields on the user model
}
);
//pre-save hook to hash users password before storinng it in the database
userSchema.pre('save', async function(next){ 
    if(!this.isModified('password')) return next(); //if the password is not modified, then called the next function
    ; try {
        const salt = await bcrypt.genSalt(10);//this is used to generate the salt 
        //                                      that is used to hash the password and store it in a variable called salt
        this.password = await bcrypt.hash(this.password, salt);//once the salt is generated, it is used to hash the password
        next();
    } catch (error) {
        next(error);
        
    }

});

    
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
 };



 

    
const User = mongoose.model('User', userSchema);
 export default User