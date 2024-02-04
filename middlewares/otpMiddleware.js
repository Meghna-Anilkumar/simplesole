// const nodemailer=require('nodemailer')
// const OTP=require('../models/otpSchema')

// const otpMiddleware = async (req, res, next) => {
//     try {
//       const { email, otp } = req.body;
  
//       // Check if the provided OTP is valid
//       const otpRecord = await OTP.findOne({ email, otp, expirationTime: { $gt: new Date() } }).lean();
  
//       if (!otpRecord) {
//         // Invalid or expired OTP
//         return res.json({ message: 'Invalid or expired OTP', type: 'danger' });
//       }
  
//       // OTP is valid, remove the OTP record
//       await OTP.deleteOne({ email, otp }); // Use deleteOne to remove the document
  
//       next(); // Continue to the next middleware or route handler
//     } catch (error) {
//       console.error(error);
//       res.json({ message: error.message, type: 'danger' });
//     }
//   };
  

// module.exports = otpMiddleware;