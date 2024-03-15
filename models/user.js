const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        required: true,
        
    },
    blocked: { type: Boolean, default: false },

    usedCoupons:{
        type:Array,
        default:[]
    }
})

userSchema.pre('save', async function (next) {
    try {
        if (!this.isBlocked) {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(this.password, salt);
            this.password = hashedPassword;
            this.confirmPassword = hashedPassword
        }
        next();
    } catch (error) {
        next(error);
    }
})


module.exports = mongoose.model('User', userSchema)