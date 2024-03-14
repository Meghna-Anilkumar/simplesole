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
               
            },
            quantity: {
                type: Number,
                
            },
            price: {
                type: Number,
            }, 

            itemstatus: {
                type: String,
                enum: ['PENDING', 'CANCELLED'],
                default: 'PENDING'
              },

              cancellationReason: {
                type: String,
                required: function () {
                    return this.itemStatus === 'CANCELLED'
                }   
              }
        }
    ],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    totalAmount: {
        type: Number,
        
    },
    paymentMethod: {
        type: String,
        enum: ['CASH_ON_DELIVERY', 'WALLET', 'RAZORPAY'],
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED','RETURNED'],
        default: 'PENDING'
    },
    orderdate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    },
    cancellationReason: {
        type: String,
        required: function () {
            return this.orderStatus === 'CANCELLED'
        }   
    },
    returnReason: {
        type: String,
        required: function () {
            return this.orderStatus === 'DELIVERED';
        }
    },

})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
