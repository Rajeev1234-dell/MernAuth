import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    email:{type:String, required: true, unique: true},
    password:{type: String, required: true},
    name: {type: String, required: true},
    lastLogin: {type: Date, default: Date.now},
    isVerified: {type: Boolean, default: false},
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: String,
}, {timestamps:true})

export const user = mongoose.model("user", userschema)