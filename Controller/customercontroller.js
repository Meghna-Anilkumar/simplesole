const User = require('../models/user')
const OTP = require('../models/otpSchema')
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const Category = require('../models/category')
const { generateReferralCode } = require('../utils/generatereferral');
const Wallet=require('../models/wallet')


module.exports = {

  register: async (req, res) => {
    try {
      const { name, email, password, confirmPassword,referralCode } = req.body;

      const nameRegex = /^[A-Za-z]+$/;

    if (!nameRegex.test(name)) {
      const categories = await Category.find();
      return res.render('userviews/signup', {
        error: 'Please enter a valid name!!!!!',
        title: 'Signup',
        category: categories,
      });
    }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      const categories = await Category.find();
      return res.render('userviews/signup',{error:'Password should contain atleast 8 characters,an uppercase letter,a lowercase letter and a special character',title:'Signup',category: categories});
    }

    if (password !== confirmPassword) {
      const categories = await Category.find();
      return res.render('userviews/signup', {
        error: 'Password and Confirm Password do not match',
        title: 'Signup',
        category: categories
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const categories = await Category.find();
      return res.render('userviews/signup', {
        error: 'Email already exists. Please use a different email address.',
        title: 'Signup',
        category: categories,
      })
    }

    if (referralCode) {
      const referredUser = await User.findOne({ referral: referralCode });
      if (!referredUser) {
        const categories = await Category.find();
        return res.render('userviews/signup', {
          error: 'Invalid referral code. Please enter a valid referral code or leave it empty.',
          title: 'Signup',
          category: categories,
        });
      }
    }

      console.log(email)
      
      req.session.email=email;

      const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false, digits: true });

      const otpRecord = new OTP({
        name: req.body.name,
        email: req.body.email,
        otp: otp,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
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

      console.log('verifying jjjjjjjj')

      const { otp: otpArray } = req.body; 
      const [email, myotp] = otpArray;
      
      console.log(email)

      const otpRecord = await OTP.findOne({ email})
      console.log(otpRecord)

      if (!otpRecord || myotp !== otpRecord.otp) {
       const categories = await Category.find();
       return res.render('userviews/otp',{error:'Invalid otp',category: categories,email})
      }

      console.log(myotp)
      console.log(otpRecord.otp)

      const referral= generateReferralCode();

      if (myotp == otpRecord.otp) {

        console.log('success otp')
        const user = new User({
          name: otpRecord.name,
          email: otpRecord.email,
          password: otpRecord.password,
          confirmPassword: otpRecord.confirmPassword,
          otp: otpRecord.otp,
          expiresAt: otpRecord.expiresAt,
          blocked: otpRecord.blocked,
          referral
        });

        await user.save();

        if (referral) {
          const referredUser = await User.findOne({ referral });
          if (referredUser) {
            const wallet = await Wallet.findOneAndUpdate(
              { user: referredUser._id },
              { $inc: { balance: 100 } }, // Increment balance by 100 Rs
              { new: true }
            );
            // Handle if wallet doesn't exist
            if (!wallet) {
              // Create new wallet if not found
              const newWallet = new Wallet({
                user: referredUser._id,
                balance: 100, // Credit 100 Rs
              });
              await newWallet.save();
            }
          }
        }
  
        req.session.isAuth = true
        req.session.user = user
        res.redirect('/');

      }
    } catch (error) {
      console.error(error)
      res.json({ message: error.message, type: 'danger' })
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



