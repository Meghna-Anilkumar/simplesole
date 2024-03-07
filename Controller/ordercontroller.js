const Cart = require('../models/cartSchema')
const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const Address = require('../models/address')
const Order = require('../models/orderSchema')
const Razorpay = require('razorpay')
const crypto = require('crypto')
require('dotenv').config()

//Razorpay instance
const instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

module.exports = {

  placeorder: async (req, res) => {
    try {
      const { paymentMethod } = req.body;
      console.log('Received data:', req.body);
      const user = req.session.user;
      const cart = await Cart.findOne({ user }).populate('items.product').exec();
  
      const newOrder = new Order({
        user: req.session.user,
        items: cart.items,
        shippingAddress: req.body.selectedAddress,
        totalAmount: cart.total,
        paymentMethod,
      });
  
      await Promise.all(
        cart.items.map(async (item) => {
          const product = await Product.findById(item.product._id);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        })
      );
  
      await newOrder.save();
  
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        cart.items = [];
        cart.total = 0;
        await cart.save();
  
        return res.render('userviews/successpage'); 
      }
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  processPayment: async (req, res) => {
    try {
      const { paymentMethod } = req.body;
      const user = req.session.user;
      const cart = await Cart.findOne({ user }).populate('items.product').exec();
  
      if (paymentMethod === 'RAZORPAY') {
        console.log('hiiiiiii');
        const amountInPaise = Math.round(cart.total * 100);
        const razorpayOptions = {
          amount: amountInPaise,
          currency: 'INR',
          receipt:`order_rcpt_${Math.random().toString(36).substring(7)}`,
        };
        console.log('razorpay', razorpayOptions);
  
        instance.orders.create(razorpayOptions, async function (err, razorpayOrder) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Razorpay order creation failed' });
          }
          console.log('Razorpay order created successfully');
  
          const newOrder = new Order({
            user: user,
            items: cart.items,
            totalAmount: cart.total,
            shippingAddress: req.body.selectedAddress,
            paymentMethod: 'RAZORPAY',
            paymentStatus: 'paid', 
            razorpayOrderId: razorpayOrder.id,
          });
          await newOrder.save();
  
          await Cart.findOneAndDelete({ user: user });
          return res.render('userviews/successpage', { order: newOrder });
        })
      } else {
        
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
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
  },

  // order cancellation
  confirmcancellation: async (req, res) => {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;
    console.log('Received cancellation request for order:', orderId);
    try {
      console.log('Attempting to find order in the database');
      const order = await Order.findById(orderId);

      if (!order) {
        console.log('Order not found');
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.orderStatus !== 'CANCELLED') {
        await Promise.all(order.items.map(async (item) => {
          const product = await Product.findById(item.product._id);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }));

        order.orderStatus = 'CANCELLED';
        order.cancellationReason = cancellationReason || '';
        await order.save();

        return res.json({ message: 'Order cancelled successfully' });
      } else {
        return res.status(400).json({ error: 'Order is already cancelled' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  //item cancellation
  confirmItemCancellation: async (req, res) => {
    const { orderId, index } = req.params;
    const { itemCancellationReason } = req.body;

    try {
      const order = await Order.findById(orderId).populate('items.product');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const itemIndex = parseInt(index, 10);
      const item = order.items[itemIndex];

      if (!item) {
        return res.status(404).json({ error: 'Item not found in the order' });
      }

      if (item.itemstatus !== 'CANCELLED') {
        item.itemstatus = 'CANCELLED';
        item.cancellationReason = itemCancellationReason;

        if (item.product && item.product.price) {
          const cancelledItemTotal = item.product.price * item.quantity;
          order.totalAmount = (order.totalAmount || 0) - cancelledItemTotal;
        } else {
          return res.status(500).json({ error: 'Product price is undefined' });
        }

        await order.save();

        console.log('Order after item cancellation:', order);

        const allItemsCancelled = order.items.every(item => item.itemstatus === 'CANCELLED');

        console.log('All items cancelled:', allItemsCancelled);

        if (allItemsCancelled) {
          order.orderStatus = 'CANCELLED';

          order.cancellationReason = itemCancellationReason || '';

          await order.save();

          console.log('Order status after updating:', order.orderStatus);
        }

        return res.json({ message: 'Item cancelled successfully' });
      } else {
        return res.status(400).json({ error: 'Item is already cancelled' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


}