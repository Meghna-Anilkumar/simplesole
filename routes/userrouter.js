const express = require('express')
const router=express.Router()
const User=require('../models/user')
const multer=require('multer')
const fs=require('fs')
const usercontroller=require('../Controller/usercontroller');
const productcontroller=require('../Controller/productcontroller');
const bcrypt=require('bcrypt')
const categorycontroller=require('../Controller/categorycontroller');
const isAuth = require('../middlewares/isAuth')

router.get(['/','/home'],usercontroller.homepage)
router.get('/signup',isAuth.islogged,usercontroller.signup)
router.get('/login',isAuth.islogged,usercontroller.loginpage)
router.post('/login',usercontroller.tologin)
// router.get('/usericon',usercontroller.userIcon)
router.get('/category/:categoryId',productcontroller.getproductsCategorywise)
router.get('/products/:id',productcontroller.getproductdetails)
router.get('/Login',usercontroller.Login)

// //get login page
// router.get('/login', (req, res)=>{
//     res.render('userviews/login', {
//         title:'Login'
// })
// })



module.exports = router