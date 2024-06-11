const { Product } = require('../../models/productsSchema') ////proper import of model from schema is needed /// npm i -D handlebars@4.5.0
const { Category } = require('../../models/categorySchema')
const fs = require("fs")
const path = require("path")




////render products list page in admin page
const showproductslist = async (req, res) => {
  try {
    // Ensure that the database connection is established
    console.log("Fetching products...");
    var page = 1
    if (req.query.page) {
      page = req.query.page
    }
    console.log(page)
    let limit = 5
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'category',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit * 1
      }
    ])
    const count = await Product.find({}).count()
    const totalPages = Math.ceil(count / limit)  // Example value
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    console.log(products);
    res.render('admin/products', { products, pages, currentPage: page, admin: true, layout: 'adminlayout' });
  } catch (error) {
    console.log("Something went wrong", error);
    res.status(500).send("Internal Server Error");
  }
}

const addproduct_page = async (req, res) => {


  try {
    const categories = await Category.find().lean()
    //console.log(categories)
    res.render('admin/addProduct', { admin: true, categories, layout: 'adminlayout' })

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");;

  }
}
const addproduct = async (req, res) => {

  try {
    const files = req.files
    const images = []
    files.forEach((file) => {
      const image = file.filename;
      images.push(image);
    });
    // images.push(req.files.filename)
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      stock: req.body.stock,
      //Image: req.body.image
      image: images
    });
    await newProduct.save().then(result => {
      res.redirect('/admin/products')
      console.log(newProduct)
    })
      .catch(err => console.log(err))

  } catch (error) {
    console.error("Error creating Product:", error)

  }
}

const deleteproduct = async (req, res) => {
  try {
    let productId = req.params.id;
    const productdata = await Product.findById(productId)
    const isBlocked = productdata.is_blocked;
    console.log(isBlocked)
    await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          is_blocked: !isBlocked,
        },
      })
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");

  }
}
/////complete delte of product
const fullDeleteProd = async (req, res) => {
  try {
    let { id } = req.body;
    const deletedprod = await Product.findByIdAndDelete(id)
    res.redirect('/admin/products')

    const product = deletedprod.image///passing images as array field to product

    product.forEach((deletedImage) => {

      const imagePath = path.join(__dirname, `../../public/images/products/${deletedImage}`);
      console.log(imagePath)
      fs.unlinkSync(imagePath);

    })

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");

  }
}

/////edit product
const showeditprodpage = async (req, res) => {
  try {

    const prodid = req.params.id
    console.log(prodid)
    const product = await Product.findById({ _id: prodid }).lean()
    console.log(product)
    const category = await Category.find().lean()
    console.log(category)
    res.render('admin/editProduct', { admin: true, product, category, layout: 'adminlayout' })

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
}
const editProduct = async (req, res) => {
  try {
    const Files = req.files
    const prodid = req.params.id
    const product = await Product.findById(prodid).lean()
    const extimages = product.image
    let updImages = []
    // Files.forEach((file)=>{
    //   images.push(file)
    // })
    if (Files && Files.length > 0) {
      const newImages = req.files.map((file) => file.filename);
      updImages = [...extimages, ...newImages];
      // product.image = updImages;

    }
    else {
      updImages = extimages
    }
    const { name, price, description, category, stock } = req.body

    await Product.findByIdAndUpdate(prodid,
      {
        name: name,
        price: price,
        description: description,
        category: category,
        image: updImages,
        stock: stock,
        isBlocked: false


      },
      { new: true })
    res.redirect('/admin/products')


  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
}


const deleteProdImage = async (req, res) => {
  try {

    const { id, image } = req.query
    const product = await Product.findById(id);

    const name = product.image.splice(image, 1);
    const deletedImage = name[0]
    console.log("deleted image==>", name)


    await product.save();
    const imagePath = path.join(__dirname, `../../public/images/products/${deletedImage}`);
    console.log(imagePath)

    // Delete the image file from the server
    fs.unlinkSync(imagePath);
    // fs.unlinkSync(path.join(__dirname,`../public/images/products/${name}`))

    res.status(200).send({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

const blockProducts = async (req, res) => {
  try {
    const { id } = req.body
    console.log(id)
    const product = await Product.findById(id)
    let newisBlocked = !product.isBlocked

    await Product.findByIdAndUpdate(id, { isBlocked: newisBlocked }).then(() => res.redirect('/admin/products'))
    //res.redirect('/admin/products')

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
}


module.exports = {
  showproductslist,
  addproduct_page,
  addproduct,
  blockProducts,

  deleteproduct,
  showeditprodpage,
  editProduct,
  fullDeleteProd,
  deleteProdImage

}

// "hbs": "^4.2.0"