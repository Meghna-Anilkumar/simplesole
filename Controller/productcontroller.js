const Product = require('../models/product')
const Category = require('../models/category');
const multer = require('multer')
const fs = require('fs')
const categorycontroller = require('../Controller/categorycontroller');

module.exports = {

  //to get add product page  
  addProduct: async (req, res) => {
    const category = await Category.find().exec();
    res.render('adminviews/addproduct',
      {
        title: 'Add Product',
        category: category
      })
  },

  //get all products
  getproducts: async (req, res) => {
    try {
      const product = await Product.find().populate({
        path: 'category',
        select: 'name',
      }).exec();
      res.render('adminviews/products', {
        title: 'Products',
        product: product
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  },


  //insert a new product into database
  addnewproduct: async (req, res) => {
    try {
      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        size: req.body.size,
        color: req.body.color,
        images: req.files.map(file => file.filename)
      })
      await product.save()
      req.session.message = {
        type: 'success',
        message: 'Product added successfully'
      };

      res.redirect('/products');
    } catch (error) {
      console.error(error);
      res.json({ message: error.message, type: 'danger' });
    }
  },

  //edit a product
  editproduct: async (req, res) => {
    try {
      let id = req.params.id;
      const product = await Product.findById(id).exec()

      if (!product) {
        res.redirect('/products');
        return;
      }

      const category = await Category.find().exec();

      res.render('adminviews/editproduct', {
        title: 'Edit Product',
        product: product,
        category: category,
        existingImages: product.images
      });
    } catch (error) {
      console.error(error);
      res.redirect('/products');
    }
  },

// Update user route (update button click event)
updateproduct: async (req, res) => {
  try {
    const id = req.params.id;
    let newImages = '';

    if (req.file) {
      newImages = req.file.filename;

      try {
        await fs.unlinkSync('./uploads/' + req.body.old_images);
      } catch (err) {
        console.log(err);
      }
    } else {
      newImages = req.body.old_images;
    }

    const existingProduct = await Product.findById(id).exec();

    let updatedImages = [...existingProduct.images];

    console.log('req.body.deletedImages:', req.body.deletedImages);

    if (req.body.deletedImages) {
      try {
        const product = await Product.findById(id);

        if (product && Array.isArray(product.images)) {
          // Create a new array excluding the deleted images
          const deletedImages = req.body.deletedImages.split(',').map(image => image.trim());
          updatedImages = product.images.filter(image => !deletedImages.includes(image));

          // Update the product document with the new images array
          product.images = updatedImages;

          // Save the updated product document
          await product.save();

          // Log the removed images
          deletedImages.forEach(deletedImage => {
            console.log(updatedImages.includes(deletedImage)
              ? 'Image Removed from Database:' : 'Image Not Found in Database:', deletedImage);
          });
        }
      } catch (err) {
        console.log(err);
      }
    }

    console.log('Updated Images:', updatedImages);

    // Combine existing images with new ones
    updatedImages = [...updatedImages, ...req.files.map(file => file.filename)];

    const updatedProduct = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      size: req.body.size,
      color: req.body.color,
      images: updatedImages,
    };

    const result = await Product.findByIdAndUpdate(id, updatedProduct);

    req.session.message = {
      type: 'success',
      message: 'Product updated successfully!',
    };

    console.log('Product updated successfully');
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    res.json({ message: err.message, type: 'danger' });
  }
},


  //to display products categorywise on user side
  getproductsCategorywise: async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      console.log(categoryId)
      const selectedCategory = await Category.findById(categoryId);
      console.log(selectedCategory)
      const products = await Product.find({ category: categoryId });
      console.log(products)
      res.render('userviews/viewproductsCategorywise', { title: 'Products in category', category: selectedCategory, selectedCategory: selectedCategory, products: products });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },


  //get product details
  getproductdetails: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate({ path: 'category', select: 'name-_id' });

      if (!product) {
        return res.status(404).render('error', { message: 'Product not found' });
      }

      const products = await Product.find();

      const selectedCategory = product.category

      res.render('userviews/productdetails', { title: 'Products in category', category: selectedCategory, selectedCategory: selectedCategory, products: products, product: product});
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  //block and unblock a product
  blockProduct: async (req, res) => {
    const productId = req.body.productId;

    try {

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send('Product not found');
      }

      product.blocked = !product.blocked;
      await product.save();

      res.redirect('/products');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },


  //get all products page
  getAllProducts: async (req, res) => {
    try {
        const allProducts = await Product.find();
        const category = await Category.find().exec();

        if (req.query.sortOption === 'priceLowToHigh') {
          allProducts.sort((a, b) => a.price - b.price);
        } else if (req.query.sortOption === 'priceHighToLow') {
          allProducts.sort((a, b) => b.price - a.price);
        }

        res.render('userviews/allproducts', {
            title: 'All Products',
            allProducts: allProducts,
            category: category, 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
},

};








