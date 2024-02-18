const express = require('express')
const session = require('express-session')
const router = express.Router()
const User = require('../models/user')
const multer = require('multer')
const fs = require('fs')
const usercontroller = require('../Controller/usercontroller');
const productcontroller = require('../Controller/productcontroller');
const bcrypt = require('bcrypt')
const categorycontroller = require('../Controller/categorycontroller');
const isAuth = require('../middlewares/isAuth')
const UserDetails = require('../models/userdetails')
const cartcontroller = require('../Controller/cartcontroller')
const checkoutcontroller = require('../Controller/checkoutcontroller')
const ordercontroller = require('../Controller/ordercontroller')



router.get(['/', '/home'], usercontroller.homepage)
router.get('/signup', isAuth.islogged, usercontroller.signup)
router.get('/login', isAuth.userexist, usercontroller.loginpage)
router.post('/login', usercontroller.tologin)
router.get('/category/:categoryId', productcontroller.getproductsCategorywise)
router.get('/products/:id', productcontroller.getproductdetails)
router.get('/Login', usercontroller.Login)
router.get('/usericon', usercontroller.userIcon)
router.post('/editprofiledetails', usercontroller.editprofiledetails)

//address
router.get('/address', usercontroller.getaddressbook)
router.post('/saveaddress', usercontroller.addnewaddress)
router.get('/getaddresses', usercontroller.getaddresses)
router.post('/deleteaddress/:id', usercontroller.deleteAddress)
router.post('/updateAddress/:addressId', usercontroller.editAddress)

//change password
router.get('/changepassword', usercontroller.changepasswordpage)
router.post('/changepassword', usercontroller.changepassword)

//cart
router.get('/cart', isAuth.checkAuth, cartcontroller.getcart)
router.post('/cart/add', isAuth.checkAuth, cartcontroller.addtocart)
router.post('/updateQuantity/:productId/:change', cartcontroller.updatequantity)
router.post('/removeItem/:productId', cartcontroller.deleteitem)

//checkout page
router.get('/proceedtocheckout', isAuth.checkAuth, checkoutcontroller.checkoutpage)

//place order
router.post('/placeOrder', isAuth.checkAuth, ordercontroller.placeorder)

//my orders
router.get('/orders', isAuth.checkAuth, ordercontroller.myorders)
router.get('/orderdetails/:orderId', isAuth.checkAuth, ordercontroller.orderdetails)


module.exports = router