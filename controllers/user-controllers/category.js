const {Product}  = require('../../models/productsSchema')
const {Category} = require('../../models/categorySchema')

const catFilter = async(req, res)=>{
    try {
        const { catId, page } = req.body;
        console.log(page);
        const limit = 6;
        const skip = (page - 1) * limit;

        let query = { isBlocked: false };
        if (catId) {
            query.category = catId;
        }

        const products = await Product.find(query)
            .populate('category', 'category')
            .skip(skip)
            .limit(limit)
            .lean();
            console.log(products)

        const count = await Product.countDocuments(query);
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.json({ productData: products, pages, currentPage: page, catId, count });
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }   
}


const categoryFilter = async(req, res)=>{
    try {
        const id       = req.query.id
        const catData  = await Category.find().lean()
        var page = 1
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 6;
        const productData = await Product.find({ isBlocked: false })
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .populate('category','category')
        .lean()

        const count = await Product.find({}).count();
        const totalPages = Math.ceil(count / limit)
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.render( 'user/category', {productData, catData ,proData, pages, currentPage: page,})
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");;
        res(500)
    }   
}








module.exports = {
    catFilter,
   // loadWomCat,
    categoryFilter,

}