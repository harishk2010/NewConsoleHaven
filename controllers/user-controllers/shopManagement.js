const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Wishlist = require('../../models/wishlist')
const mongoose = require('mongoose')

let userData


// const getProduct = async (req, res) => {
//     try {
//         userData=req.session.user
//         const catName = await Product.aggregate([
//             {
//                 $match: {
//                     isBlocked: false
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'category',
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category'
//                 }
//             },
//             {
//                 $unwind: '$category'
//             },

//         ])
//         const newProduct = await Product.find().sort({ createdOn: -1 }).limit(3).lean()
//         var page = 1
//         if (req.query.page) {
//             page = req.query.page
//         }
//         const limit = 3;
//         const loadCatData = await Category.find().lean()
//         const proData = await Product.find({ isBlocked: false })
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .populate('category', 'category')
//             .lean()//||false;
//         const count = await Product.find({}).count();
//         const totalPages = Math.ceil(count / limit)
//         const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//         console.log(catName, "++++++++++++++++++++++++catName")

//         res.render('user/shop', { proData, pages, currentPage: page, userData,currentFunction: 'getProductsPage', catName, loadCatData, newProduct })
//     } catch (error) {
//        console.log(error.message);
//         res.status(500).send("Internal Server Error");;
//     }
// }
// const getProductsPage = async (req, res) => {
//     const user = req.session.user;

//     try {
//         const page = parseInt(req.body.page); // Get the page number from the POST request
//         const limit = 4;
//         const proData = await Product.find({ isBlocked: false })
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .populate('category', 'category')
//             .lean();
//         const count = await Product.countDocuments({ isBlocked: false });
//         const totalPages = Math.ceil(count / limit);
//         const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
//         console.log(pages,"...pages>>>")

//         res.json({
//             proData,
//             pages,
//             currentPage: page,
//             currentFunction: 'getProductsPage',
//             count
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const getProduct = async (req, res) => {
    try {
        const userData = req.session.user;

        const catName = await Product.aggregate([
            {
                $match: {
                    isBlocked: false
                }
            },
            {
                $lookup: {
                    from: 'category',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            }
        ]);

        const newProduct = await Product.find().sort({ createdOn: -1 }).limit(3).lean();

        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }

        const limit = 6;
        const loadCatData = await Category.find().lean();
        const proData = await Product.find({ isBlocked: false })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('category', 'category')
            .lean();

        const count = await Product.countDocuments({ isBlocked: false });
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.render('user/shop', {
            proData,
            pages,
            currentPage: page,
            userData,
            currentFunction: 'getProductsPage',
            catName,
            loadCatData,
            newProduct
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

const getProductsPage = async (req, res) => {
    const user = req.session.user;

    try {
        const page = parseInt(req.body.page) || 1; // Get the page number from the POST request
        const limit = 6;
        const proData = await Product.find({ isBlocked: false })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('category', 'category')
            .lean();

        const count = await Product.countDocuments({ isBlocked: false });
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.json({
            proData,
            pages,
            currentPage: page,
            currentFunction: 'getProductsPage',
            count
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchProducts = async (req, res) => {
    try {
        const user = req.session.user;
        let search = req.query.search || '';
        let page = parseInt(req.query.page) || 1;
        const limit = 6;


        const loadCatData = await Category.find().lean();


        const searchResult = await Product.find({
            isBlocked: false,
            name: { $regex: ".*" + search + ".*", $options: "i" }
        })
            .populate('category')
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Count the total number of matching documents
        const count = await Product.countDocuments({
            isBlocked: false,
            name: { $regex: ".*" + search + ".*", $options: "i" }
        });

        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        if (user) {
            const findUser = await User.findById(user);

            res.render("user/shop", {
                user: findUser,
                proData: searchResult,
                loadCatData,
                pages,
                currentPage: page,
                count
            });
        } else {
            res.render("user/shop", {
                proData: searchResult,
                loadCatData,
                pages,
                currentPage: page,
                count
            });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const productSearch = async (req, res) => {
    const { search, catId } = req.body

    console.log(search, catId);

    if (catId) {

        try {
            const products = await Product.find({ category: catId, name: { $regex: search, $options: 'i' } });
            res.json(products);
        } catch (error) {
            // console.log(error.message);
            res.status(500).send("Internal Server Error");;
            return res.status(500).send();
        }


    } else {
        try {
            const products = await Product.find({ name: { $regex: search, $options: 'i' } });
            //  console.log(products);

            res.json(products);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");;
            return res.status(500).send();
        }

    }
}


const sortProduct_az = async (req, res) => {
    try {
        const { sort, catId } = req.body

        if (catId) {
            const products = await Product.find({ category: catId }, { isBlocked: false }).sort({ name: sort }).populate('category', 'category').lean();
            res.json(products)

        } else {
            const products = await Product.find({ isBlocked: false }).sort({ name: sort }).populate('category', 'category').lean();
            res.json(products)
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}
const sortProductByName = async (req, res) => {
    try {
        const { sort, catId, page } = req.body;
        //console.log('Sort:', sort); // Log sort order
        const limit = 6;
        const skip = (page - 1) * limit;

        let query = { isBlocked: false };
        if (catId) {
            query.category = catId;
        }

        const sortOrder = sort === 'asc' ? 1 : -1;

        const products = await Product.find(query)
            .sort({ name: sortOrder })
            .populate('category', 'category')
            .skip(skip)
            .limit(limit)
            .lean();

        const count = await Product.countDocuments(query);
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        res.json({ productData: products, pages, currentPage: page, sort });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const sortProductByArrival = async (req, res) => {
    try {
        // const { sort, catId, page } = req.body;
        // //console.log('Sort:', sort); // Log sort order
        // const limit = 4;
        // const skip = (page - 1) * limit;

        // let query = { isBlocked: false };
        // if (catId) {
        //     query.category = catId;
        // }

        // const sortOrder = sort === 1 ? 1 : -1;

        // const products = await Product.find(query)
        //     .sort({ createdOn: sortOrder })
        //     .populate('category', 'category')
        //     .skip(skip)
        //     .limit(limit)
        //     .lean();

        // const count = await Product.countDocuments(query);
        // const totalPages = Math.ceil(count / limit);
        // const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        // res.json({ productData: products, pages, currentPage: page, sort });
        const { sort, catId, page } = req.body;
        const limit = 6;
        const skip = (page - 1) * limit;

        let query = {};
        if (catId) query.category = catId;
        const sortOrder = sort === 1 ? 1 : -1;

        const products = await Product.find(query)
            .sort({ createdOn: sortOrder })
            .populate('category', 'category')
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            productData: products,
            pages: Array.from({ length: totalPages }, (_, i) => i + 1),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const sortProductByPrice = async (req, res) => {
    try {
        const { sort, catId, page } = req.body;
        // console.log(sort, catId, page); // Log sort order
        const limit = 6;
        const skip = (page - 1) * limit;

        let query = { isBlocked: false };
        if (catId) {
            query.category = catId;
        }

        const products = await Product.find(query)
            .sort({ price: sort })
            .populate('category', 'category')
            .skip(skip)
            .limit(limit)
            .lean();

        const count = await Product.countDocuments(query);
        const totalPages = Math.ceil(count / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        // console.log(totalPages, pages,"jsjsjs",products)

        res.json({ productData: products, pages, currentPage: page, sort });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sortProductByPopularity = async (req, res) => {
    try {

        const { sort, catId, page } = req.body;
        const limit = 6;
        const skip = (page - 1) * limit;

        let query = {};
        if (catId) query.category = catId;

        const products = await Product.find(query)
            .sort({ popularity: sort })
            .populate('category', 'category')
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            productData: products,
            pages: Array.from({ length: totalPages }, (_, i) => i + 1),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {


    getProduct,
    productSearch,
    sortProduct_az,
    sortProductByPrice,
    searchProducts,
    getProductsPage,
    sortProductByName,
    sortProductByArrival,
    sortProductByPopularity
    // sortProduct_az,
    // sortProductByPrice,
    // catFilter,

}