const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,

        required: true
    },
    productId: {
        type: Array,
        ref: "product",
        required: true

    }
})
const Wishlist = mongoose.model("wishlist", wishlistSchema)
module.exports = Wishlist