const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Category = require('../models/category')
const Product = require('../models/product')
const multer = require('multer')
const fs = require('fs')
var uploadMiddleware = require('../middlewares/multer')
var otpMiddleware = require('../middlewares/otpMiddleware')
const customercontroller = require('../Controller/customercontroller');
const admincontroller = require('../Controller/admincontroller');
const productcontroller = require('../Controller/productcontroller');
const categorycontroller = require('../Controller/categorycontroller');
const isAuth = require('../middlewares/isAuth')
const adminAuth = require('../middlewares/adminAuth')
const adminordercontroller = require('../Controller/adminordercontroller')

router.get('/adminlogin', admincontroller.toadminlogin)
router.post('/signup', customercontroller.register)
router.get('/dashboard', admincontroller.dashboard)
router.get('/customers', customercontroller.customers)
router.post('/block-user', customercontroller.blockUser);
router.get('/admin', adminAuth.isadminlogged, admincontroller.toadminlogin)
router.post('/adminlogin', admincontroller.adminlogin)
router.get('/addcategory', categorycontroller.addCategory)
router.post('/addCategory', categorycontroller.addNewCat)
router.get('/categories', categorycontroller.getcategories)
router.get('/editCategory/:id', categorycontroller.editcategory)
router.post('/updateCategory/:id', categorycontroller.updatecategory)
router.post('/blockCat', categorycontroller.blockCategory)
router.get('/products', productcontroller.getproducts)
router.get('/addProduct', productcontroller.addProduct)
router.post('/addProduct', uploadMiddleware, productcontroller.addnewproduct)
router.get('/editProduct/:id', productcontroller.editproduct)
router.post('/updateProduct/:id', uploadMiddleware, productcontroller.updateproduct)
router.post('/verify-otp', customercontroller.verifyotp)
router.post('/blockProduct', productcontroller.blockProduct)

//admin logout
router.get('/adminlogout',admincontroller.adminlogout)

//orders
router.get('/adminorders', adminordercontroller.orderspage)
router.get('/ordersview/:id', adminordercontroller.adminvieworder)
router.post('/updateOrderStatus/:orderId', adminordercontroller.updateorderstatus)



module.exports = router