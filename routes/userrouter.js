const express = require('express')
const session = require('express-session')
const router=express.Router()
const User=require('../models/user')
const multer=require('multer')
const fs=require('fs')
const usercontroller=require('../Controller/usercontroller');
const productcontroller=require('../Controller/productcontroller');
const bcrypt=require('bcrypt')
const categorycontroller=require('../Controller/categorycontroller');
const isAuth = require('../middlewares/isAuth')
const UserDetails=require('../models/userdetails')

router.get(['/','/home'],usercontroller.homepage)
router.get('/signup',isAuth.islogged,usercontroller.signup)
router.get('/login',isAuth.userexist,usercontroller.loginpage)
router.post('/login',usercontroller.tologin)
router.get('/category/:categoryId',productcontroller.getproductsCategorywise)
router.get('/products/:id',productcontroller.getproductdetails)
router.get('/Login',usercontroller.Login)
router.get('/usericon',usercontroller.userIcon)
router.post('/editprofiledetails',usercontroller.editprofiledetails)
router.get('/address',usercontroller.getaddressbook)
router.post('/saveaddress',usercontroller.addnewaddress)
router.get('/getaddresses',usercontroller.getaddresses)



module.exports = router