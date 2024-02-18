const bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(bodyParser.json())
const Order = require('../models/orderSchema')

module.exports = {

  orderspage: async (req, res) => {
    try {
      const orders = await Order.find();
      res.render('adminviews/orders', { title: 'Orders', orders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  adminvieworder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('items.product').populate('shippingAddress');

      res.render('adminviews/vieworder', { title: 'View order', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  //update order status
  updateorderstatus: async (req, res) => {
    const orderId = req.params.orderId;
    const newOrderStatus = req.body.orderStatus;
    try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: newOrderStatus }, { new: true });
      res.json(updatedOrder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

  },

}