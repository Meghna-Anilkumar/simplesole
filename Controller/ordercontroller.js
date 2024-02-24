const Cart = require('../models/cartSchema')
const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const Address = require('../models/address')
const Order = require('../models/orderSchema')

module.exports = {

  placeorder: async (req, res) => {
    try {
      const user = req.session.user
      const { paymentMethod } = req.body;
      const cart = await Cart.findOne({ user }).populate('items.product').exec();

      const newOrder = new Order({
        user: req.session.user,
        items: cart.items,
        shippingAddress: req.body.selectedAddress,
        totalAmount: cart.total,
        paymentMethod,

      });

      await Promise.all(cart.items.map(async item => {
        const product = await Product.findById(item.product._id);
        if (product) {
            product.stock -= item.quantity;
            await product.save();
        }
    }));
    
      await newOrder.save();

      cart.items = [];
      cart.total = 0;
      await cart.save();

      res.render('userviews/successpage')
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  successpage: async (req, res) => {
    try {
      const categories = await Category.find();
      res.render('userviews/successpage', { category: categories });
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // get my orders page
  myorders: async (req, res) => {
    try {
      const user = req.session.user;
      const orders = await Order.find({ user }).populate('items.product').exec();

      const categories = await Category.find();

      res.render('userviews/myorders', { title: 'My Orders', orders, category: categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  //orderdetails
  orderdetails: async (req, res) => {
    try {
      const user = req.session.user;
      const orderId = req.params.orderId;

      console.log("Order ID:", orderId);

      const order = await Order.findById(orderId).populate('items.product').populate('shippingAddress').exec();

      if (!order) {
        console.log("Order not found");
        return res.status(404).json({ error: 'Order not found' });
      }

      const categories = await Category.find();
      res.render('userviews/orderdetails', { title: 'My Orders', order, category: categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }



}