/////////////////////////////////////////

let AdminEmail="admin@gmail.com"
let AdminPassword ="admin@123"

let Adata

///////////////////////////////////


const adminlogin = async (req, res) => {
    try {
      res.render('admin/adminlogin', {  layout:'loginlayout'})
  
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
  
    }
  }

const doAdminLogin=async (req,res)=>{
    try {
        // const {email,password}=req.body
        Adata=req.body
        let Email=req.body.email
        console.log(Email)
        let Password=req.body.password
        console.log(Password)

        if(Email==AdminEmail && Password==AdminPassword){
            req.session.admin=Adata
            res.redirect('/admin')
        }else{
            res.redirect('/admin/adminlogin')
        }

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
        
    }
}
const doLogout=async(req,res)=>{
    try {
        req.session.destroy()
        Adata=null
        res.redirect('/admin/adminlogin')
        
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
module.exports={
    adminlogin,
    doAdminLogin,
    doLogout
}

