const mongoose = require('mongoose');

const categoryofferSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,  
  },
  startDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});

const CategoryOffer = mongoose.model('Offer', categoryofferSchema);

module.exports = CategoryOffer;