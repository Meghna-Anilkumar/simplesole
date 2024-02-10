const Category=require('../models/category')

module.exports ={

    //to get add category page  
    addCategory:async(req,res)=>{
      res.render('adminviews/addcategory',
      {title:'Add Category'})
    },

    //to add new category
    addNewCat: async (req, res) => {
      try {
        const category = new Category({
          name: req.body.name
        });
    
        await category.save();
        console.log('category added successfully')
        req.session.message = {
          type: 'success',
          message: 'Category added successfully'
        };
    
        res.redirect('/categories');
      } catch (error) {
        console.error(error);
        res.json({ message: error.message, type: 'danger' });
      }
    },

 

    //get all categories
    getcategories: async (req, res) => {
      try {
        const category = await Category.find().exec();
        res.render('adminviews/categories', {
          title: 'Categories',
          category: category
        });
      } catch (err) {
        res.json({ message: err.message });
      }
    },

  //edit a category 
  editcategory: async (req, res) => {
  let id = req.params.id;
   Category.findById(id)
    .then(category => {
      if (category === null) {
        // category not found
        res.redirect('/categories');
      } else {
        res.render('adminviews/editcategory', {
          title: 'Edit Category',
          category: category
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.redirect('/categories');
    });
},



  //Update user route(update button click event)
    updatecategory: async(req, res) => {
    let id = req.params.id;
    try {
      const result = await Category.findByIdAndUpdate(id, {
        name: req.body.name,
      });
  
      req.session.message = {
        type: 'success',
        message: 'Category updated successfully!',
      };
      console.log('category updated successfully')
      res.redirect('/categories');
    } catch (err) {
      res.json({ message: err.message, type: 'danger' });
    }
  },


  //block and unblock the category
  blockCategory: async (req, res) => {
    const categoryId = req.body.categoryId;
  
    try {
      console.log('categoryId:', categoryId);
      const category = await Category.findById(categoryId);
      console.log(category);
  
      if (!category) {
        return res.status(404).send('Category not found');
      }
  
      category.blocked = !category.blocked;

      await category.save();
  
      res.redirect('/categories');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  

  
}