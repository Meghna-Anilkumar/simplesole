const Cart=require('../models/cartSchema')
const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const {calculateTotalPrice}=require('../utils/cartfunctions')
const Address=require('../models/address')

module.exports={
checkoutpage:async(req,res)=>{
    const user=req.session.user
    const categories = await Category.find(); 
    const addresses = await Address.find({ user: user });
    const cart = await Cart.findOne({ user }).populate('items.product').exec();
    res.render('userviews/checkout',{title:'checkout page',category: categories,cart,addresses: addresses})
},

}