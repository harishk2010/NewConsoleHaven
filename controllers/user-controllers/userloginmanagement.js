const { User } = require('../../models/userSchema')
const { Category } = require('../../models/categorySchema')
const { Product } = require('../../models/productsSchema')
const Cart=require('../../models/cart')
const userHelper = require('../../helpers/user_helper')
const argon2 = require('argon2')
const Wishlist = require('../../models/wishlist')
const mongoose = require('mongoose')

let otp
let userotp
let usermail
let hashedPassword
let userRegestData
let userData


const gethome = async (req, res) => {

    try {
     
        //
        let userData=req.session.user
        


        const catagories = await Category.find({ isListed: true }).lean()
        //   console.log(catagories)

        const products = await Product.aggregate([
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
        ])
        //   console.log(produts)
        res.render('user/index', { products, catagories,userData,  layout: 'layout' })


    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}


const showloginpage = async (req, res) => {
    const regSuccessMsg = 'User registered sucessfully..!!'
    const blockMsg = 'Sorry something went wrong..!!'
    const mailErr = 'Incorrect email or password..!!'
    const newpasMsg = 'Your password reseted successfuly..!!'
    message2 = false


    try {
        if (req.session.mailErr) {
            res.render('user/login', { mailErr })
            req.session.mailErr = false
        }
        else if (req.session.regSuccessMsg) {
            res.render('user/login', { regSuccessMsg })
            req.session.regSuccessMsg = false
        }
        else if (req.session.userBlocked) {
            res.render('user/login', { blockMsg })
            req.session.userBlocked = false
        }
        else if (req.session.LoggedIn) {
            res.render('user/login')
            req.session.LoggedIn = false
        }
        else if (req.session.newPas) {
            res.render('user/login', { newpasMsg })
            req.session.newPas = false
        }
        else {
            res.render('user/login')
        }

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

/////login submition
const dologin = async (req, res) => {
    try {

        const Email = req.body.email;
        const Password = req.body.password;

        userData = await User.findOne({ email: Email });

        if (userData) {
            if (await argon2.verify(userData.password, Password)) {

                const isBlocked = userData.isBlocked

                if (!isBlocked) {

                    req.session.LoggedIn = true
                    req.session.user = userData

                    res.redirect('/')
                   
                } else {
                    userData = null
                    req.session.userBlocked = true
                    res.redirect('/login')
                }
            }
            else {
                req.session.mailErr = true
                res.redirect('/login')
            }
        } else {
            req.session.mailErr = true
            res.redirect('/login')
        }

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

//logout 
const doLogout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log("Logout error");
                res.redirect("/");
            }
            console.log("Logged out successfully");
            res.redirect("/login");
        })
        userData = null
        
    } catch (error) {
        console.log(error.message);
    }
}
///render signup page
const showsigninpage = async (req, res) => {
    try {
        res.render('user/signup')
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
///user signup

const dosignup = async (req, res) => {
    try {
        const msg = 'User already exists'
        hashedPassword = await userHelper.hashpassword(req.body.password)
        usermail = req.body.email
        userRegestData = req.body

        const userExist = await User.findOne({ email: usermail }).lean()
        if (!userExist) {
            otp = await userHelper.verifyEmail(usermail)
            res.redirect('/submit_otp')
        } else {
            res.redirect('/login')
        }

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}
////////get otp page
const getotppage = async (req, res) => {
    try {
        res.render('user/sotp')
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

//verify otp and add user data to DB
const submitotp = async (req, res) => {
    userotp = req.body.otp
    console.log(userotp)

    if (userotp == otp) {
        const user = new User({
            name: userRegestData.name,
            email: userRegestData.email,
            mobile: userRegestData.phone,
            password: hashedPassword,
            isBlocked: false
        })
        await user.save()
        req.session.regSuccessMsg = true
        res.json({ status: true })

        console.log(user)
       // res.redirect('/login')
    } else {
       // res.redirect('/submit_otp')
        res.json({ status: false })
    }

}
const resendOtp = async (req, res) => {
    try {
        otp = await userHelper.verifyEmail(usermail)
        res.redirect('/submit_otp')

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

////detailed product view
const getproducts = async (req, res) => {
    userData=req.session.user
    try {
        const item = req.params.id
        console.log(item)
        

        const product = await Product.findById(item).lean()
      let ProductExistInCart
      let outOfStock
        const ProductExist= await Cart.find({
            userId:userData._id ,
             product_Id:item
            })
            console.log(ProductExist)
            if(ProductExist.length===0){
                ProductExistInCart=false
            }else{
                ProductExistInCart=true
            }
            if(product.stock===0){
                outOfStock=true

            }
        console.log(ProductExistInCart)
        await Product.updateOne(
            {
                _id: item
            },
            {
                $inc:{
                    popularity:1
                }
            }
        )
       
        res.render('user/productDetails', { product,outOfStock, ProductExistInCart,userData, layout: 'layout' })

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}


///////////////////////other pages

const aboutpage = async (req, res) => {
    try {
        res.render('user/about')

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}

module.exports = {
    showloginpage,
    showsigninpage,
    getotppage,
    dosignup,
    submitotp,
    resendOtp,

    dologin,
    doLogout,
    gethome,
    getproducts,

    //////// other pages //////
    aboutpage

}

