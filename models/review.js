// models/reviewSchema.js
const mongoose = require("mongoose");

const Schema=mongoose.Schema

const reviewSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        required: true
    },

    productId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    isListed: {
        type: Boolean,
        default: true
    },
    // rating: {
    //     type: Number,
    //     required: true,
    //     min: 1,
    //     max: 5
    // },

    comment: {
        type: String,
        required: true
    },

   
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;