const express = require('express')
const session = require('express-session')


module.exports={
    islogged:(req,res,next)=>{
     if(req.session.isAuth){
        res.redirect('/')
     }
     else{
        next()
     }
    }




    }
