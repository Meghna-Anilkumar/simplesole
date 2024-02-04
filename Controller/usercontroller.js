const User=require('../models/user')
const bcrypt=require('bcrypt')
const Category = require('../models/category')

module.exports ={

    //view homepage
    homepage : async(req, res) => {
        try {
          
             const category = await Category.find().exec();
             
              res.render('userviews/home', {
              title: 'Home',
              category: category,
            });
          } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
          }
        },

    //get login page
    loginpage: async (req, res) => {
        try {
            const categories = await Category.find();
            req.session.isAuth=false
            res.render('userviews/login', { title: 'Login', category: categories });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    

    //to login
    tologin: async (req, res) => {
      try {
        
          const { email, password } = req.body;
  
          const user = await User.findOne({ email: email });
  
          if (!user || user.blocked) {
              return res.redirect('/login');
          }
  
          const isMatch = await bcrypt.compare(password, user.password);

          console.log('isMatch:', isMatch);

          if (isMatch) {
              req.session.isAuth = true;
              req.session.user = user;
              console.log('Redirecting to /');
              return res.redirect('/');
              
         } else {
              // Incorrect password
              console.log('Incorrect password');
              return res.redirect('/login');
              
          }
      } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
      }
  },

    //to signup
    signup: async(req,res)=>{
    const categories = await Category.find();
    res.render('userviews/signup',
    {title:'Signup page',category: categories}
    )},

    
    //to logout
    

   //usericon
   userIcon:async(req,res)=>{
   res.render('userviews/profile')

   },

   //already have an account
   Login:async(req,res)=>{
    res.render('userviews/login')
   }

  
}