import mongoose from "mongoose";

const productSchema = new mongoose.Schema({ ////this is a function that defines the stucture(schema) of the products. 
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    description: {
        type: string,
        required: [true, 'Please add a description'],
    },
    price: {
        type: number,
        required: [true, 'Please add a price'],
        default: 0,
    },
    image: {
        type: string,
        required: [true, "Please add an image"],
    },
    category: {
        type: string,
        required: [true, "Please place in a category"],
    },
    countInStock:{
        type: number,
        required: [true, "Please add a count in stock"],
    },
    rating: {
        type: number,
        
    },
    isFeatured: {
        type: booleon,
        default: false
    },
        
    }
, {timestamps: true})


const Product = mongoose.model('Product', productSchema);//this is a function that create a product based on the prodcutSchema specfied 

export default Product