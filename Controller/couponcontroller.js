const Coupon = require('../models/coupon')
const Cart = require('../models/cartSchema')
const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const Order = require('../models/orderSchema')

module.exports={

couponpage:async(req,res)=>{
    res.render('adminviews/coupon', { title: 'Coupon Page' })
}




}