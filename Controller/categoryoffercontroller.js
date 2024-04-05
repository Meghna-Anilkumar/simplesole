const Category = require('../models/category')
const isAuth = require('../middlewares/isAuth')
const Product = require('../models/product')
const Order = require('../models/orderSchema')
const User = require('../models/user')
const CategoryOffer = require('../models/categoryoffer')


module.exports = {

    //get category offers page
    getcategoryofferspage: async (req, res) => {
        try {
            const categories = await Category.find().lean();
            const categoryOffers = await CategoryOffer.find().populate('category')

            res.render('adminviews/categoryoffer', { title: 'Category Offers', categories: categories, categoryOffers: categoryOffers });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },


    savecategoryoffer: async (req, res) => {
      try {
          const { categoryId, discountPercentage, startDate, expiryDate } = req.body;
  
          const categoryProducts = await Product.find({ category: categoryId });
  
          let totalProductPrice = 0;
          categoryProducts.forEach(product => {
              totalProductPrice += product.price;
          });
          const averageProductPrice = totalProductPrice / categoryProducts.length;
  
          const discountAmount = (averageProductPrice * discountPercentage) / 100;
          const newPrice = averageProductPrice - discountAmount;
  
          const categoryOffer = new CategoryOffer({
              category: categoryId,
              discountPercentage,
              startDate,
              expiryDate,
              newPrice,
          });
  
          const savedCategoryOffer = await categoryOffer.save();
  
          res.status(200).json(savedCategoryOffer); 
      } catch (error) {
          console.error('Error saving category offer:', error);
          res.status(500).json({ error: 'Failed to save category offer' });
      } 
  },
  


    //edit category offer
    updatecategoryoffer:async(req,res)=>{
        try {
            const { offerId, categoryId, discountPercentage, startDate, expiryDate } = req.body;
        
            const updatedCategoryOffer = await CategoryOffer.findByIdAndUpdate(offerId, {
              category: categoryId,
              discountPercentage: discountPercentage,
              startDate: startDate,
              expiryDate: expiryDate
            }, { new: true });
        
            if (!updatedCategoryOffer) {
              return res.status(404).json({ error: 'Category offer not found' });
            }
        
            res.status(200).json(updatedCategoryOffer); 
          } catch (error) {
            console.error('Error updating category offer:', error);
            res.status(500).json({ error: 'Failed to update category offer' });
          }
    }

}