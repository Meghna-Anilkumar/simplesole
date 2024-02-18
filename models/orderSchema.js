const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                // required: true
            },
            quantity: {
                type: Number,
                // required: true
            },
            price: {
                type: Number,
                // required: true
            }
        }
    ],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        // required: true
    },
    totalAmount: {
        type: Number,
        // required: true
    },
    paymentMethod: {
        type: String,
        enum: ['CASH_ON_DELIVERY', 'WALLET', 'RAZORPAY'],
        // required: true
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        // default: 'PENDING'
    },
    orderdate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    }

});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
