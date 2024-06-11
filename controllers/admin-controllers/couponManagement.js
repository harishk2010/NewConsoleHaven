const Coupon=require('../../models/couponSchema')




const couponPage= async(req,res)=>{
    try {
        const couponData = await Coupon.find().lean();

       // const now = moment();
    
        // const couponData = coupon.map((cpn) => {
        //   const formattedDate = moment(cpn.expiryDate).format("MMMM D, YYYY");
    
        //   return {
        //     ...cpn,
        //     expiryDate: formattedDate,
        //   };
        // });
    
    
        res.render('admin/coupon',{couponData, title:"Admin",layout:'adminlayout'})
    } catch (error) {

        console.log(error.message);
        res.status(500).send("Internal Server Error");
        
    }
}

const addCouponPage= async(req,res)=>{
    const couponMsg = "Coupon added successfuly..!!";
    const couponExMsg = "Coupon alredy exist..!!";

    try {
        if (req.session.coupon) {
            res.render("admin/addcoupon",{  couponMsg ,title:"Admin",layout:'adminlayout'});
            req.session.coupon = false;
          } else if (req.session.exCoupon) {
            
            res.render("admin/addcoupon", { couponExMsg ,title:"Admin",layout:'adminlayout'});
            req.session.exCoupon = false;
          } else {
            res.render("admin/addcoupon",{ couponExMsg ,title:"Admin",layout:'adminlayout'});
          }
    } catch (error) {

        console.log(error.message);
        res.status(500).send("Internal Server Error");
        
    }
}
const addCouponPost = async (req, res) => {
    try {
      const { code, percent, expDate } = req.body;
  
      const cpnExist = await Coupon.findOne({ code: code });
  
      if (!cpnExist) {
        const coupon = new Coupon({
          code: code,
          discount: percent,
          expiryDate: expDate,
        });
  
        await coupon.save();
        req.session.coupon = true;
        res.redirect("/admin/addcoupon");
      } else {
        req.session.exCoupon = true;
        res.redirect("/admin/addcoupon");
      }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
  };

  const deleteCoupon= async(req,res)=>{
    try {

        const {id}=req.body
        await Coupon.findByIdAndDelete(id)
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");

        
    }
  }
module.exports={
    couponPage,
    addCouponPage,
    addCouponPost,
    deleteCoupon
}