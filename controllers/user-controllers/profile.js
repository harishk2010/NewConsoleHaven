const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const { User } = require('../../models/userSchema')
const Wishlist = require('../../models/wishlist')
const { Address } = require('../../models/addressSchema')
const Cart = require('../../models/cart')
const Order = require('../../models/order')

const userHelper = require('../../helpers/user_helper')


const mongoose = require('mongoose')
const ObjectId = require('mongoose')


const viewUserProfile = async (req, res) => {
    try {

        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id);
        const userDataObject = userData.toObject();
        res.render('user/profile', { userData: userDataObject });
        console.log(userData)
        // res.render('user/profile',{userData})
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const EditUserProfile = async (req, res) => {
    try {

        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id);
        const userDataObject = userData.toObject();
        console.log(userData)
        res.render('user/editProfile', { userData: userDataObject })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const image = req.file
        let imageFileName;
        if (req.file) {
            imageFileName = req.file.filename;
        } else {
            imageFileName = req.session.user.image;
        }
        console.log(image, "<>", imageFileName)


        const id = req.params.id

        await User.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                image: imageFileName
            }
        }, { new: true })

        res.redirect('/profile')

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}


/// To get manage address page ///



const manageAddress = async (req, res) => {
    try {
        const user = req.session.user;
        const id = user._id;

        // Find user addresses
        const userAddresses = await Address.find({ userId: id }).lean();
        // console.log(userAddresses)

        // Fetch user data
        const userData = await User.findById(id);
        // console.log(userData)

        // Render the 'address' template with user addresses and data
        res.render('user/address', { userAddress: userAddresses, userData: userData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}




const addAddress = async (req, res) => {
    try {
        res.render('user/addAddress')
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}

const addAddressPost = async (req, res) => {
    try {
        const userData = req.session.user
        const id = userData._id

        const adress = new Address({
            userId: id,
            name: req.body.name,
            mobile: req.body.mobile,
            addressLine1: req.body.address1,
            addressLine2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            pin: req.body.pin,
            is_default: false,
        })

        const adressData = await adress.save()
        res.redirect('/addresses')
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}

const editAddressPost = async (req, res) => {
    try {

        const id = req.params.id

        await Address.findByIdAndUpdate(id, {
            $set: {
                name: req.body.name,
                mobile: req.body.mobile,
                addressLine1: req.body.address1,
                addressLine2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                pin: req.body.pin,
            }
        }, { new: true })

        res.redirect('/addresses')

        // Find user addresses
        // const userAddresses = await Address.find({ userId: id }).lean();
        // res.render('user/editAddress')
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}

const editAddress = async (req, res) => {
    try {

        const id = req.params.id

        const address = await Address.findById(id).lean();
        // const addressObject = address.toObject();
        console.log(address)

        res.render('user/editAddress', { address })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}

const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id
        const ID = new mongoose.Types.ObjectId(id)
        console.log(ID)
        await Address.findByIdAndDelete(id)
        console.log(id)
        res.redirect('/addresses')

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

const myorders = async (req, res) => {
    try {
        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id).lean();
        // const userDataObject = userData.toObject();
        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 10;
        const skip = (page - 1) * limit;

        console.log(userData, "userdata")
        // const Id
        const myOrders = await Order.aggregate([
            {
                $match:{
                    userId:new mongoose.Types.ObjectId(id)
                }
            },
            {
                $project:{
                    _id:1,
                    date:1,
                    orderId:1,
                    status:1,
                    amountAfterDscnt:1,
                    total:1,

                }

            },
            {
                $sort:{
                    date:-1
                }
            },
            {
                $skip:skip
            },
            {
                $limit:limit
            }
            
        ])
        const count = await Order.find({}).count()
    const totalPages = Math.ceil(count / limit)  // Example value
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        console.log(myOrders, "myOrders")
        res.render('user/myOrders', { userData: userData, myOrders ,pages, currentPage: page })

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
const orderDetails = async (req, res) => {
    try {
        let ct = 0
        let ct2 = 0
        const orderId = req.params.id;
        const user = req.session.user;
        const userId = user._id;
        let offerprice=0



        // Retrieve user data
        const userData = await User.findById(userId).lean();

        // Retrieve order details including populated address
        const myOrderDetails = await Order.findById(orderId).populate('address').lean();
        // let hasReturnedItems = myOrderDetails.product.some(product => product.isReturned);
        // let allCancelled = myOrderDetails.product.every(product => product.isCancelled);
        // let allReturned = myOrderDetails.product.every(product => product.isReturned);
        await myOrderDetails.product.forEach((product) => {
            if (product.isReturned) {
                ct++
            }
            if (product.isCancelled) ct2++
            offerprice+= product.price* product.quantity
        })
        let check = function (a, b) {
            if (a + b === myOrderDetails.product.length) {
                return true
            } else {
                return false
            }
        }

        if (check(ct, ct2) && ct>0  && myOrderDetails.status !== "Returned") {
            await Order.findByIdAndUpdate(myOrderDetails._id, { $set: { status: 'Returned' } }, { new: true });
            myOrderDetails.status = "Returned";
        }else{
            if(check(ct2,ct) && ct2>0 && myOrderDetails.status !== "Cancelled" &&  myOrderDetails.status !== "Returned"){
                await Order.findByIdAndUpdate(myOrderDetails._id, { $set: { status: 'Cancelled' } }, { new: true });
                myOrderDetails.status = "Cancelled";
            }
        }

       // myOrderDetails.allCancelled = allCancelled;
       // myOrderDetails.allReturned = allReturned;

        if (!myOrderDetails) {
            return res.status(404).send("Order not found");
        }

        // Retrieve ordered product details
        const orderedProDet = await Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 1,
                    product: 1
                }
            }
        ]);
        const address=await Address.findOne(
            {
                userId:userId
            }
        ).lean()
        console.log(address,"address")

        console.log("myOrderDetails:", myOrderDetails);
        //console.log("orderedProDet:", orderedProDet);
        offerprice-=(myOrderDetails.total)

        res.render('user/orderDetails', {offerprice, address,orderedProDet, myOrderDetails, userData });
    } catch (error) {
        console.error("Error fetching order details:", error.message);
        res.status(500).send("Internal Server Error");
    }
};



const changepassword = async (req, res) => {
    try {
        const user = req.session.user
        const id = user._id
        const userData = await User.findById(id).lean();

        res.render('user/changepassword', { userData })

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}


const changepass = async (req, res) => {

    try {

        const { oldPass, newPass } = req.body
        const userId = req.session.user
        const findUser = await User.findOne({ _id: userId }).lean()
        const passwordMatch = await userHelper.hashpassword(oldPass);

        if (passwordMatch) {

            const saltRounds = 10;
            const hashedPassword = await userHelper.hashpassword(newPass);
            console.log('Hashed Password:', hashedPassword);
            await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        password: hashedPassword
                    }
                }
            )
            console.log('Password changed successfully.');
            res.json({ status: true })

        } else {
            console.log('Old password does not match.');
            res.json({ status: false })
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");;
    }
}



const cancelorder = async (req, res) => {
    try {
        let notcancelledAmt = 0
        const id = req.params.id
        const ID = new mongoose.Types.ObjectId(id)
        const { updateWallet, payMethod } = req.body

        await Order.updateOne({ _id: ID },
            {
                $set: {
                    status: "Cancelled"
                }
            }
        )
        const canceledorder = await Order.findOne({ _id: ID })

        if (canceledorder.paymentMethod === 'wallet' || canceledorder.paymentMethod === 'razorpay') {
            for (const data of canceledorder.product) {

                // arr.push(data._id);
                await Product.updateMany({ _id: data._id }, { $inc: { stock: data.quantity } });

                await User.updateMany(
                    { _id: req.session.user._id },
                    { $inc: { wallet: data.price * data.quantity } }
                );
                notcancelledAmt += data.price * data.quantity;

            }
            await User.updateOne(
                { _id: req.session.user._id },

                {
                    $push: {
                        history: {
                            amount: notcancelledAmt,
                            status: "refund",
                            date: Date.now()
                        }
                    }
                }
            )

        }
        console.log(notcancelledAmt, "notcanceled")

        res.json(true);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}




const cancelOneProduct = async (req, res) => {
    try {
        const { id, prodId } = req.body
        const ID = new mongoose.Types.ObjectId(id)
        const PRODID = new mongoose.Types.ObjectId(prodId)
        console.log(ID)
        console.log(id, prodId)
        const n = await Order.findOneAndUpdate(
            {
                _id: ID,
                "product._id": PRODID
            },
            {
                $set: {
                    "product.$.isCancelled": true,
                }

            },
            {
                new: true
            }
        ).lean().then(() => {
            return res.json({
                success: true,
                message: "Succefully removed product"
            })
        })
        const result = await Order.findOne(
            {
                _id: ID,
                "product._id": PRODID
            },
            {
                "product.$": 1
            }

        ).lean()
        const podquant = result.product[0].quantity
        console.log(podquant, "<---------------->")
        await Product.findOneAndUpdate(
            { _id: PRODID },
            {
                $inc: { stock: podquant }
            }
        )
        console.log(n)

        // const check=await Product.findOne(
        //         {_id:PRODID},


        //     ).lean()
        // console.log(check,"checkcheckcheck")


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}


const verify = (req, res) => {
    console.log(req.body.payment, "end");
    const { orderId } = req.body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.payment
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);
    hmac.update(
        `${razorpay_order_id}|${razorpay_payment_id}`
    );
    hmac = hmac.digest("hex");
    console.log(hmac, "HMAC");
    console.log(razorpay_signature, "signature");
    if (hmac === razorpay_signature) {
        console.log("true");
        changeOrderStatusToConfirmed(orderId)
        res.json({ status: true });
    } else {
        console.log("false");
        res.json({ status: false });
    }
};


const walletpage = async (req, res) => {
    try {
        const user = req.session.user;
        const id = user._id;
        const userData = await User.findById(id).lean();


        console.log(userData);

        var page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        let limit = 5;
        const skip = (page - 1) * limit;

        const historyData = await User.aggregate([
            {
                $match: {
                    _id: userData._id
                }
            },
            {
                $project: {
                    _id: 0,
                    history: 1
                }
            },
            {
                $unwind: "$history"
            },
            {
                $sort: { "history.date": -1 } // Sort the history array by date in descending order
            },
            {
                $group: {
                    _id: "$_id",
                    history: { $push: "$history" }
                }
            },
            {
                $project: {
                    history: { $slice: ["$history", skip, limit] }
                }
            }
        ]);

        const count = await User.aggregate([
            { $match: { _id: userData._id } },
            { $project: { historyCount: { $size: "$history" } } }
        ]);

        const totalItems = count[0] ? count[0].historyCount : 0;
        const totalPages = Math.ceil(totalItems / limit);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        const history = historyData[0] ? historyData[0].history : [];

        console.log(history);

        res.render('user/wallet', { userData, history, pages });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}



module.exports = {
    viewUserProfile,
    EditUserProfile,
    updateUserProfile,
    manageAddress,
    addAddress,
    addAddressPost,
    editAddress,
    editAddressPost,
    deleteAddress,


    //////orders
    myorders,
    orderDetails,
    cancelorder,
    cancelOneProduct,

    ////change password
    changepassword,
    changepass,

    //wallet
    walletpage,
    //returnOrder,
    verify
}