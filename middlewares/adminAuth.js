const express = require('express')
const session = require('express-session')

//isAuth middleware
const isadminAuth = (req, res, next) => {
  if (req.session.isadminAuth) {
    next();
  } else {
    res.redirect('/admin')
  }
};

module.exports = {
  isadminlogged: (req, res, next) => {
    if (req.session.isadminAuth) {
      res.redirect('/dashboard')
    }
    else {
      next()
    }
  }

}