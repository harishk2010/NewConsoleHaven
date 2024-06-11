const mongoose=require("mongoose");
// const { array } = require('../multer/product_control')

const Schema=mongoose.Schema

const productSchema=new Schema({
    name:{
        type:String,
        required: true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required: true
    },
   
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'category',
        required: true

    },
    
    image:{
        type: Array,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },

    isBlocked: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type:Date,
        default:  Date.now
    },
    popularity:{
        type:Number,
        default:0
    },
    bestSelling:{
        type:Number,
        default:0
    }
    
})

//model name "product" will turn into collection name in DB
const Product = mongoose.model("product",productSchema);
module.exports={
    Product
}