var express = require('express');

const { logedout, logedin, isBlocked } = require('../middleware/usersAuth')

const { resendOtp, gethome, showloginpage, dologin, getotppage, dosignup, showsigninpage, submitotp, getproducts, doLogout, aboutpage } = require('../controllers/user-controllers/userloginmanagement')
const { submitMail, submitMailPost, forgotOtppage, forgotOtpSubmit, resetPasswordPage, resetPassword } = require('../controllers/user-controllers/forgotPassword')
const {
    viewUserProfile,
    EditUserProfile,
    updateUserProfile,
    manageAddress,
    addAddress,
    addAddressPost,
    editAddress,
    editAddressPost,
    deleteAddress,
    myorders,
    orderDetails,
    changepassword,
    changepass,
    cancelorder,
   // cancelOneProduct,
    walletpage,
   // returnOrder,
   verify
    
} = require('../controllers/user-controllers/profile')

const { addMoneyToWallet , verifyPayment }= require('../controllers/user-controllers/walletController')

const { loadCartPage, addToCart, removeFromCart, updateCart } = require('../controllers/user-controllers/cart')

const { loadCheckoutPage, placeorder, orderSuccess , validateCoupon , removeCoupon , applyCoupon } = require('../controllers/user-controllers/checkoutManagement')

const { showWishlistPage, addToWishList, removeFromWishList } = require('../controllers/user-controllers/wishlistManagement')

const { getProduct, 
    searchAndSort  } = require('../controllers/user-controllers/shopManagement')

const { cancelOrder,returnOrder, cancelOneProduct , returnOneProduct,getInvoice , addNewReviewPost}= require('../controllers/user-controllers/ordercontroller')

var router = express.Router();
const Upload = require("../multer/user_multer")

/* GET home page. */
router.get('/', gethome);

router.get('/productDetails/:id', getproducts)
router.post('/addReview', logedin, isBlocked, addNewReviewPost)

///login and logout

router.get('/login', logedout, showloginpage)
router.post('/login', dologin)
router.get('/logout', doLogout)

router.get('/signup', logedout, showsigninpage)
router.post('/signup', logedout, dosignup)

router.get('/submit_otp', logedout, getotppage)
router.post('/submit_otp', logedout, submitotp)
router.get('/resend_otp', logedout, resendOtp)
router.get('/forgotPassword', logedout, submitMail)
router.post('/forgotPassword', logedout, submitMailPost)
router.get('/otp', logedout, forgotOtppage)
router.post('/otp', forgotOtpSubmit)
router.get('/resetPassword', logedout, resetPasswordPage)
router.post('/resetPassword', resetPassword)


/////////profile
// router.get('/profile',logedin,viewUserProfile)
router.get('/profile', logedin, isBlocked, viewUserProfile)
router.get('/edit_profile', logedin, isBlocked, EditUserProfile)
router.post('/edit_profile/:id', logedin, isBlocked, Upload.single('image'), updateUserProfile)


///adress
router.get('/addresses', logedin, isBlocked, manageAddress)
router.get('/add_address', logedin, isBlocked, addAddress)
router.post('/add_address', logedin, isBlocked, addAddressPost)
router.get('/edit_address/:id', logedin, isBlocked, editAddress)
router.post('/edit_address/:id',  logedin, isBlocked,editAddressPost)
router.get('/delete_address/:id', logedin, isBlocked, deleteAddress)

///change password
router.get('/changepassword', logedin, isBlocked, changepassword)
router.post('/changepass', logedin, isBlocked, changepass)

//wallet
router.get('/wallet', logedin, isBlocked,walletpage)
router.post('/addmoneytowallet', logedin, isBlocked,addMoneyToWallet)
router.post('/verify_Payment', logedin, isBlocked,verifyPayment)

/////order
router.post('/placeorder', placeorder)
router.get('/orderPlaced', logedin, isBlocked, orderSuccess)
router.get('/orderDetails/:id', logedin, isBlocked, orderDetails)
router.post('/cancelorder/:id', cancelorder)
router.post('/verifyPayment', logedin, isBlocked, verify)


// router.post('/returnorder/:id',returnOrder)
router.post('/cancelOneProduct', cancelOneProduct)
router.post('/validate_coupon', logedin, isBlocked, validateCoupon)
router.post('/apply_coupon',applyCoupon)
router.post('/remove_coupon',removeCoupon)
router.get('/get_invoice', logedin, isBlocked, getInvoice)

////userOrder related
router.get('/myorders', logedin, isBlocked, myorders)

/////cart
router.get('/cart', logedin, isBlocked, loadCartPage)
router.post('/addtocart/:id', logedin, isBlocked, addToCart)
router.post('/removeFromCart', logedin, isBlocked, removeFromCart)

router.post('/updatecart', updateCart)


//// checkout
router.get('/cart/checkout', logedin, isBlocked, loadCheckoutPage)


//// wishlist

router.get('/wishlist', logedin, isBlocked, showWishlistPage)
router.post('/addtowishlist', logedin, isBlocked, addToWishList)
router.post('/removeFromWishList', logedin, isBlocked, removeFromWishList)


/////// shop
router.get('/shop', getProduct)
router.post('/search',searchAndSort)

/////////// other pages
router.get('/about', aboutpage)

router.get('/trigger-500', (req, res, next) => {
    const error = new Error('This is a simulated 500 error.');
    error.status = 500;
    next(error);
});


router.put('/cancel-order/:id', cancelOrder);

router.put('/return-order/:id', returnOrder);

router.put('/cancel-one-product', cancelOneProduct);

router.put('/return-one-product', returnOneProduct);
module.exports = router;
