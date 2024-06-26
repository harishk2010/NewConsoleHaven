const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Wishlist = require('../../models/wishlist')
const mongoose = require('mongoose')

let userData

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



// const searchProducts = async (req, res) => {
//     try {
//         const user = req.session.user;
//         let search = req.query.search || '';
//         let page = parseInt(req.query.page) || 1;
//         const limit = 6;


//         const loadCatData = await Category.find().lean();


//         const searchResult = await Product.find({
//             isBlocked: false,
//             name: { $regex: ".*" + search + ".*", $options: "i" }
//         })
//             .populate('category')
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .lean();

//         // Count the total number of matching documents
//         const count = await Product.countDocuments({
//             isBlocked: false,
//             name: { $regex: ".*" + search + ".*", $options: "i" }
//         });

//         const totalPages = Math.ceil(count / limit);
//         const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

//         if (user) {
//             const findUser = await User.findById(user);

//             res.render("user/shop", {
//                 user: findUser,
//                 proData: searchResult,
//                 loadCatData,
//                 pages,
//                 currentPage: page,
//                 count
//             });
//         } else {
//             res.render("user/shop", {
//                 proData: searchResult,
//                 loadCatData,
//                 pages,
//                 currentPage: page,
//                 count
//             });
//         }

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// }



const searchAndSort= async (req, res) => {
    // const { searchQuery, sortOption, categoryFilter, page, limit } = req.body;

    // try {
    //     let query = {};
    //     if (searchQuery) {
    //         query = { name: { $regex: searchQuery, $options: 'i' } };
    //     }

    //     if (categoryFilter) {
    //         query.category = categoryFilter;
    //     }

    //     let sort = {};
    //     if (sortOption) {
    //         if (sortOption === 'priceAsc') sort.price = 1;
    //         else if (sortOption === 'priceDesc') sort.price = -1;
    //         else if (sortOption === 'nameAsc') sort.name = 1;
    //         else if (sortOption === 'nameDesc') sort.name = -1;
    //         else if (sortOption === 'newArrivals') sort.createdAt = -1;
    //         else if (sortOption === 'popularity') sort.popularity = -1;
    //     }
    //     console.log(query , sort )
    //     const products = await Product.find(query)
    //     .populate('category')
    //         .sort(sort)
    //         .skip((page - 1) * limit)
    //         .limit(limit);

    //     const totalProducts = await Product.countDocuments(query);

    //     res.json({ products, totalProducts, page, limit });
    // } catch (error) {
    //     res.status(500).json({ error: error.message });
    // }
    const { searchQuery, sortOption, categoryFilter, page, limit } = req.body;

    // Construct the match stage
    const matchStage = { $match: {} };
    if (searchQuery) {
         matchStage.$match.name = { $regex: searchQuery, $options: 'i' };
       // matchStage.$match.name = { $regex: ".*" + searchQuery + ".*", $options: "i"  };

    }
    if (categoryFilter) {
        matchStage.$match.category = new mongoose.Types.ObjectId(categoryFilter);
    }

    // Construct the sort stage
    const sortStage = { $sort: {} };
    switch (sortOption) {
        case 'priceAsc':
            sortStage.$sort.price = 1;
            break;
        case 'priceDesc':
            sortStage.$sort.price = -1;
            break;
        case 'nameAsc':
            sortStage.$sort.name = 1;
            break;
        case 'nameDesc':
            sortStage.$sort.name = -1;
            break;
        case 'newArrivals':
            sortStage.$sort.createdOn = -1;
            break;
        case 'popularity':
            sortStage.$sort.popularity = -1; 
            break;
        default:
            sortStage.$sort.createdOn = 1; 
    }

    const skipStage = { $skip: (page - 1) * limit };
    const limitStage = { $limit: limit };

    const products = await Product.aggregate([
        matchStage,
        {
            $lookup: {
                from: 'category',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true
            }
        },
        sortStage,
        skipStage,
        limitStage
    ]);
    console.log(products)

    const totalProducts = await Product.countDocuments(matchStage.$match);

    res.json({ products, totalProducts });
}
module.exports = {


    getProduct,
  
    searchAndSort

}