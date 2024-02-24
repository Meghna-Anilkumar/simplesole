const bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(bodyParser.json())

module.exports = {

  //to admin login page
  toadminlogin: async (req, res) => {
    res.render('adminviews/adminlogin', {
      title: 'Homepage'
    });
  },

  //to login the admin
  adminlogin: async (req, res) => {
    const credential = {
      email: 'admin@gmail.com',
      password: '1'
    }
    if (
      req.body.email == credential.email &&
      req.body.password == credential.password
    ) {
      req.session.isadminlogged = true
      res.render('adminviews/dashboard', { title: 'Admin Dashboard' });
    }
    else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  },

  //get dashboard
  dashboard: async (req, res) => {
    res.render('adminviews/dashboard', {
      title: 'Dashboard'
    }
    )
  },

  //admin logout
  adminlogout: async (req, res) => {

    console.log('Accessed /adminlogout');
    req.session.isadminlogged = false

    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/adminlogin')
        }
    })
},



}
