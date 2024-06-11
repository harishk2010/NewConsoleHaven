const multer=require("multer")
const path   = require('path')


const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg': 'jpeg',
    'image/jpg' : 'jpg',
    'image/avif': 'avif'
  }

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if(isValid) {
          uploadError = null
      }
        cb(null, path.join(__dirname,'../public/images/users'))
    },
    filename:(req,file,cb)=>{
        const fileName =  Date.now()+'_'+file.originalname ;
        cb(null,fileName)
        // cb(null,Date.now()+'-'+file.originalname)
        
    }

})
const upload=multer({storage})
module.exports=upload