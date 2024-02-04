const bodyParser = require('body-parser')
const express = require('express')
const app= express()
app.use(bodyParser.json())

module.exports={

//to admin login page
toadminlogin: async(req, res) => {
    res.render('adminviews/adminlogin', {
        title: 'Homepage'
    });
},

//to login the admin
adminlogin: async (req, res) => {
    const credential={
    email:'admin@gmail.com',
    password:'1'
}
    if (
      req.body.email == credential.email &&
      req.body.password == credential.password
      ) {
        req.session.isadminAuth=true
        res.render('adminviews/dashboard',{title:'Admin Dashboard'});
      }
     else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  },

  //get dashboard
  dashboard:async(req,res)=>{
    res.render('adminviews/dashboard',{
      title: 'Dashboard'
    }
   )}



}
