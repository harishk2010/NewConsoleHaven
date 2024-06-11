const mongoose = require('mongoose')

const Schema=mongoose.Schema

const CategorySchema=new Schema({
    category:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    isListed:{
        type:Boolean,
        default:true
    },
    bestSelling:{
        type:Number,
        default:0
    }
},{ collection:'category'})

const Category=mongoose.model('category',CategorySchema)

module.exports={
    Category
}

