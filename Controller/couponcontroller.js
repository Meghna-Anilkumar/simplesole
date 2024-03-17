const Coupon = require('../models/coupon')
const Cart = require('../models/cartSchema')
const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const Order = require('../models/orderSchema')
const User = require('../models/user')

module.exports = {

    couponpage: async (req, res) => {
        try {
            const coupons = await Coupon.find()
            res.render('adminviews/coupon', {
                title: 'Coupon Page',
                coupons: coupons,
            });
        } catch (error) {
            console.error('Error fetching coupons:', error);
            res.status(500).send('Error fetching coupons');
        }
    },


    createcoupon: async (req, res) => {
        try {
            console.log(req.body, 'ooooooooo')
            const { couponCode, discountRate, expiryDate } = req.body;
            const minimumPurchaseAmount = parseFloat(req.body.minPurchaseAmount);
            if (isNaN(minimumPurchaseAmount)) {
                throw new Error('Invalid minPurchaseAmount');
            }

            const newCoupon = new Coupon({
                couponCode,
                discountRate,
                minimumPurchaseAmount,
                expiryDate
            })

            await newCoupon.save()
            console.log('coupon added successfully')

            const coupons = await Coupon.find()
            res.render('adminviews/coupon', {
                title: 'Coupon Page',
                coupons: coupons,
            });
        } catch (error) {
            console.error('Error creating coupon:', error);
            res.status(500).send('Error creating coupon');
        }
    },


    //to display all coupons in the coupon page
    getCoupons: async (req, res) => {
        try {
            const coupons = await Coupon.find();
            res.render('adminviews/coupon', { title: 'Coupon Page', coupons });
        } catch (error) {
            console.error('Error fetching coupons:', error);
            res.status(500).send('Error fetching coupons');
        }
    },


    //display coupons to user
    coupons: async (req, res) => {
        try {
            const coupons = await Coupon.find();
            res.json(coupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            res.status(500).json({ error: 'Error fetching coupons' });
        }
    },


    // Apply coupon
    applyCoupon: async (req, res) => {
        try {
            const { couponCode } = req.body;
            console.log(couponCode, 'pppppp');
            const userId = req.session.user._id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const cart = await Cart.findOne({ user }).populate('items.product').exec();

            console.log('ggggggggggggggggggggggggggggg')

            if (couponCode) {
                const coupon = await Coupon.findOne({ couponCode });
                if (coupon && cart.total >= coupon.minimumPurchaseAmount) {

                    if (user.usedCoupons && user.usedCoupons.includes(coupon._id)) {
                        return res.status(400).json({ error: 'You have already used this coupon.' });
                    }

                    console.log(user.usedCoupons, 'ppppppppp')

                    cart.total -= (cart.total * coupon.discountRate) / 100;
                    await cart.save();

                    if (!user.usedCoupons) {
                        user.usedCoupons = [];
                    }
                    user.usedCoupons.push(coupon._id);
                    await user.save();
                    return res.json({ success: true, newTotal: cart.total });
                } else {
                    return res.status(400).json({ error: 'Invalid or expired coupon code' });
                }
            } else {
                return res.status(400).json({ error: 'Coupon code is required' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },


    //update coupon
    editCoupon: async (req, res) => {
        try {
            const { editCouponId, editCouponCode, editDiscountRate, editMinPurchaseAmount, editExpiryDate } = req.body;
            const minimumPurchaseAmount = parseFloat(editMinPurchaseAmount);
            if (isNaN(minimumPurchaseAmount)) {
                throw new Error('Invalid minPurchaseAmount');
            }
    
            console.log('editCouponId', 'uuuuuuuuuu');
            await Coupon.findByIdAndUpdate(editCouponId, {
                couponCode: editCouponCode,
                discountRate: editDiscountRate,
                minimumPurchaseAmount: minimumPurchaseAmount,
                expiryDate: editExpiryDate
            });
    
            console.log('Coupon updated successfully');
    
            const coupons = await Coupon.find();
            const coupon = await Coupon.findById(editCouponId); 
            res.render('adminviews/coupon', {
                title: 'Coupon Page',
                coupons: coupons,
                coupon: coupon 
            });
        } catch (error) {
            console.error('Error updating coupon:', error);
            res.status(500).send('Error updating coupon');
        }
    },


    // Delete coupon
deleteCoupon: async (req, res) => {
    try {
        const { id } = req.params;
        await Coupon.findByIdAndDelete(id);
        console.log('Coupon deleted successfully');
        res.redirect('/coupon')
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).send('Error deleting coupon');
    }
}



}