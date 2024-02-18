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

  //Update user route(update button click event)
  updateproduct: async (req, res) => {
    let id = req.params.id;
    let new_images = '';

    if (req.file) {
      new_images = req.file.filename;

      try {
        await fs.unlinkSync('./uploads/' + req.body.old_images);
      } catch (err) {
        console.log(err);
      }
    } else {
      new_images = req.body.old_images;
    }

    try {
      const result = await Product.findByIdAndUpdate(id, {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        stock: req.body.stock,
        size: req.body.size,
        color: req.body.color,
        images: req.files.map(file => file.filename),
      });

      req.session.message = {
        type: 'success',
        message: 'Product updated successfully!',
      };
      console.log('product updated successfully');
      res.redirect('/products');
    } catch (err) {
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

      res.render('userviews/productdetails', { title: 'Products in category', category: selectedCategory, selectedCategory: selectedCategory, products: products, product: product });
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

};








