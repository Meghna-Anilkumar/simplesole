const Cart = require('../models/cartSchema')
const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const { calculateTotalPrice } = require('../utils/cartfunctions')


module.exports = {

  //get cart
  getcart: async (req, res) => {
    try {
      const user = req.session.user;
      const cart = await Cart.findOne({ user }).populate('items.product').exec();

      if (!cart) {
        return res.render('userviews/cart', { title: 'Cart', category: [], data: { total: 0 } ,cart});
      }

      const categories = await Category.find();
      const totalPrice = calculateTotalPrice(cart.items);

      if (isNaN(totalPrice)) {
        console.error('Total price is not a number:', totalPrice);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      cart.total = totalPrice;
      await cart.save();

      const data = {
        total: totalPrice,
      };

      res.render('userviews/cart', { title: 'Cart', category: categories, cart, data });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  //add to cart 
  addtocart: async (req, res) => {
    const { productId, quantity } = req.body;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const user = req.session.user;
      let cart = await Cart.findOne({ user: user });

      if (!cart) {
        cart = new Cart({ user: user, items: [] });
      }

      const existingItem = cart.items.find(item => item.product.equals(productId));

      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
      } else {
        cart.items.push({ product: productId, quantity: parseInt(quantity) });
      }

      await cart.save();

      res.json({ message: 'Product added to cart successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
 
  },
  
  //update quantity in cart
  updatequantity: async (req, res) => {
    const { productId, change } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        const currentStock = product.stock;

        const cartItem = await Cart.findOne({ 'items.product': productId });
        if (!cartItem) {
            return res.status(404).json({ error: 'Item not found in the cart' });
        }

        const currentQuantity = cartItem.items.find(item => item.product.toString() === productId).quantity;

        const newQuantity = parseInt(currentQuantity, 10) + parseInt(change, 10);

        if (newQuantity < 1) {
            return res.status(400).json({ error: 'Quantity cannot be less than 1' });
        }

        if (newQuantity > currentStock) {
            return res.status(400).json({ error: 'Quantity exceeds available stock' });
        }

        const updatedItem = await Cart.findOneAndUpdate(
            { 'items.product': productId },
            { $set: { 'items.$.quantity': newQuantity } },
            { new: true }
        );

        const updatedQuantity = updatedItem.items.find(item => item.product.toString() === productId).quantity;

        const total = calculateTotalPrice(updatedItem.items);
        res.json({ quantity: updatedQuantity, total });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
},


  //delete an item from cart
  deleteitem: async (req, res) => {
    const { productId } = req.params;
    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { 'items.product': productId },
        { $pull: { items: { product: productId } } },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json({ error: 'Item not found in the cart' });
      }

      await updatedCart.save();

      res.json({ message: 'Item removed successfully' });
    } catch (error) {
      console.error('Error removing item:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },





}