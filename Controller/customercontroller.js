const User=require('../models/user')
const OTP=require('../models/otpSchema')
const nodemailer=require('nodemailer')
const otpGenerator=require('otp-generator')
const bcrypt= require('bcrypt')
const Category = require('../models/category')


module.exports={

  register: async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        console.log(email);
        const user = {
            name,
            email,
            password,
            confirmPassword,
        };

        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });

        const otpRecord = new OTP({
            name: req.body.name,
            email: req.body.email,
            otp: otp,
            password: req.body.password,
            confirmPassword: req.body.confirm,
            expiresAt: Date.now(),
            blocked: false,
        });

        await otpRecord.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILID,
                pass: process.env.PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.MAILID,
            to: email,
            subject: 'Your OTP for Signup',
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        };

        
        const sendMailPromise = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject('Failed to send OTP');
                }
                console.log('Email sent: ' + info.response + otp);
                console.log(otp);
                console.log(email);
                resolve(); 
            });
        });

        await sendMailPromise;

        const categories = await Category.find();

        res.render('userviews/otp', { email, category: categories }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
},

  verifyotp: async (req, res) => {
    try {
      
      const { email, otp } = req.body;
      const a=otp[0]
      const myotp=otp[1]
      console.log(otp[0])
      console.log(otp)

      console.log(email)

      const otpRecord=await OTP.findOne({email:a})
      console.log(otpRecord)
    
      if (!otpRecord) {
        return res.json({ message: 'Invalid or expired OTP', type: 'danger' });
      }

      
      console.log(myotp)
      console.log(otpRecord.otp)
      if(myotp==otpRecord.otp){

        console.log('success otp')
        const user = new User({
          name:otpRecord.name,
          email:otpRecord.email,
          password:otpRecord.password,
          confirmPassword:otpRecord.confirmPassword,
          otp:otpRecord.otp,
          expiresAt:otpRecord.expiresAt,
          blocked:otpRecord.blocked,
        });
  
        await user.save();
        req.session.isAuth=true
        req.session.user=user
        res.redirect('/');
       
      }
    } catch (error) {
      console.error(error);
      res.json({ message: error.message, type: 'danger' });
    }
  },


//get all users(from database to customers page)
    customers: async (req, res) => {
    try {
      const users = await User.find().exec();
      res.render('adminviews/customers', {
        title: 'Customers',
        users: users
      });
    } catch (err) {
      res.json({ message: err.message });
    }
  },
  
 //to block or unblock user
    blockUser: async (req, res) => {
      const userId = req.body.userId;
    
      try {
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).send('User not found');
        }
    
        user.blocked = !user.blocked;
  
        await user.save();
    
        res.redirect('/customers');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error')
      }
    },

    
}



