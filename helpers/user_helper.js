const nodemailer = require('nodemailer')
const argon2 = require('argon2')


///Email veification

const verifyEmail = async (email) => {

    try {
        const otp = generateOtp()
        console.log(otp)
        console.log(email)


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smpt.gmail.com',
            port: 587,
            secure: false,

            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
                //xyrk jiuf cnvm uian
            }
        })
        const mailoptions = {
            from: process.env.MAIL_USER,
            to: email,

            subject: 'ForVerification',
            text: `Welcome to ConsoleHaven !!! This is your OTP:  ${otp}`
        }
        transporter.sendMail(mailoptions, (error) => {
            if (error) {
               console.log(error.message);
        // res.status(500).send("Internal Server Error");
            } else {
                console.log("Email has been sent successfully")
            }
        })
        return otp



    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}


///generate otp

const generateOtp = () => {
    otp = `${Math.floor(1000 + Math.random() * 9000)}`
    return otp
}

///password hashing using argon2

const hashpassword = async (password) => {
    try {
        const passwordhash = await argon2.hash(password)
        return passwordhash

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}



module.exports = {
    verifyEmail,
    generateOtp,
    hashpassword
}