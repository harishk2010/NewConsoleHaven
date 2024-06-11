const { Category } = require('../../models/categorySchema')



///// show category page
const categoryPage = async (req, res) => {
    const catExistMsg = "Category alredy Exist..!!";
    const catEditMsg = "Category Edited Successfully..!!";
    try {
        const category = await Category.find().limit(3).lean()
        console.log(category)
        if (req.session.exist) {
            req.session.exist = false
            res.render('admin/category', { admin: true, category, catExistMsg, layout: 'adminlayout' })
        } else if (req.session.Edited) {
            req.session.Edited = false
            res.render('admin/category', { admin: true, category, catEditMsg, layout: 'adminlayout' })
        }
        res.render('admin/category', { admin: true, category, layout: 'adminlayout' })
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }

}

//// add category /////
const addcategory_page = async (req, res) => {
    const catExistMsg = "Category alredy Exist..!!";
    const catSaveMsg = "Category Added Successfully..!!";



    try {
        if (req.session.catExist) {
            res.render('admin/addCategory', { catExistMsg, layout: 'adminlayout' })
            req.session.catExist = false

        }
        else if (req.session.catSave) {
            res.render('admin/addCategory', { catSaveMsg, layout: 'adminlayout' })
            req.session.catSave = false
        }
        else {
            res.render('admin/addCategory', { layout: 'adminlayout' })
        }


    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");


    }
}

const addcategory = async (req, res) => {

    let lowcatname = req.body.name.toLowerCase()
    const images = req.file
    try {
        let catexist = await Category.findOne({ category: lowcatname })

        if (!catexist) {
            const category = new Category({
                category: lowcatname,
                image: images.filename
            })
            await category.save().then(result => {
                req.session.catSave = true

                res.redirect('/admin/addCategory')

            })

        }
        else {
            req.session.catExist = true
            res.redirect('/admin/addCategory')

        }




        // res.render('admin/add-category',{admin:true})

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}

//////show edit category and edit actegory
const showEditCategory = async (req, res) => {


    try {
        const catId = req.params.id
        const cat = await Category.findById(catId).lean()

        res.render('admin/editCategory', { admin: true, cat, layout: 'adminlayout' })

    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}
const editCategory = async (req, res) => {
    try {
        const image = req.file
        const catId = req.params.id
        const catName = req.body.name
        console.log(catName)

        const category = await Category.findById(catId).lean()
        const catImg = category.image
        let updateImg
        if (image) {
            updateImg = image.filename
        }
        else {
            updateImg = catImg
        }


        const catExist = await Category.findOne({ category: { $regex: new RegExp("^" + catName + "$", "i") } });
        if (!catExist) {
            await Category.findByIdAndUpdate(catId, {
                category: req.body.name,
                image: updateImg
            },
                { new: true }
            )
            req.session.Edited = true;
            res.redirect('/admin/category')
        } else {
            req.session.exist = true
            res.redirect('/admin/category')

        }
    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

/////delete category////////
const deleteCategory = async (req, res) => {
    try {
        const {id} = req.body
        console.log(id,"idddddddddddddddd")
        await Category.findByIdAndDelete(id)
        res.redirect('/admin/category')
    } catch (error) {

       console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}
const unListCategory = async (req, res) => {
    try {
        const {id} = req.body
        console.log(id)
        let user = await Category.findById(id)
        let newListed = user.isListed

        await Category.findByIdAndUpdate(id, {
            isListed: !newListed
        },
            { new: true })
        res.redirect('/admin/category')



    } catch (error) {
       console.log(error.message);
        res.status(500).send("Internal Server Error");

    }
}
module.exports = {
    addcategory,
    addcategory_page,
    categoryPage,
    editCategory,
    showEditCategory,
    deleteCategory,
    unListCategory

}