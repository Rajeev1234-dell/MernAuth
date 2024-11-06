import {user} from "../models/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { senderVerificationEmail, sendPasswordResetEmail, sendResetSuccessEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    const {email, password, name} = req.body;
    try {
        if(!email || !password || !name)
        {
            throw new Error("All fields are required");
        }
        const userAlreadyExist = await user.findOne({email});
        if(userAlreadyExist)
        {
            res.status(400).json({success:false, message:"User already exists"});
        }
        const hashpassword = await bcrypt.hash(password, 10);
        // const verificationToken = generateVerificationCode()
        const verificationToken = Math.floor(100000+Math.random()*900000);
        const User = new user({
            email,
            password: hashpassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })

        await User.save();

        generateTokenAndSetCookie(res, User._id);

        await senderVerificationEmail(User.email, verificationToken);

        res.status(201).json({success: true, message:"User registered successfully", user:{
            ...User._doc,
            password: null
        }});
    } catch (error) {
        res.status(400).json({success: false, message:error.message});
    }
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const User = await user.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })
        if(!User) {
            return res.status(400).json({success: false, message:"Invalid or expired verification code"});
        }
        User.isVerified = true;
        User.verificationToken = undefined;
        User.verificationTokenExpiresAt = undefined;
        await User.save();
        await sendWelcomeEmail(User.email, User.name)
        res.status(200).json({success: true, message:"Email verified successfully", user:{...User._doc, password: undefined}})
    } catch (error) {
        
    }
} 

export const login = async (req, res) => {
    const {email, password} = req.body;
    // res.json({email, password})
    try {
        const User = await user.findOne({email})
        if(!User) res.status(404).json({success: false, message:"Invalid Credentials"})
        const isPasswordValid = await bcrypt.compare(password, User.password);
        if (!isPasswordValid) res.status(400).json({success: false, message:"Invalid Credentials"})
        generateTokenAndSetCookie(res, User._id);
        User.lastLogin = new Date();
        await User.save();

        res.status(200).json({success:true, message:"Logged in successfully", user:{
            ...User._doc, 
            password: undefined, 
        }})
    } catch (error) {
        console.log("Error in Login", error);
        res.status(400).json({success: false, messaage:error.message})
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message:"Logout Successfully"});
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try {
        const User = await user.findOne({email: email});

        if(!User) res.status(400).json({success: false, message:"User Not Found"});

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        User.resetPasswordToken = resetToken;
        User.resetPasswordExpiresAt = resetTokenExpiresAt;
        
        await User.save();
        await sendPasswordResetEmail(User.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
        res.status(200).json({success: true, message:"Password reset link sent to your email"});
    } catch (error) {
        console.log("Error in forgotPassword", error);
        res.status(400).json({success:false, message:errormessage})        
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        const User = await user.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()},
        })

        if(!User) res.status(400).json({success: false, message:"Invalid or expired reset token"})

        const hashedPassword = await bcrypt.hash(password, 10);

        User.password = hashedPassword;
        User.resetPasswordToken = undefined;
        User.resetPasswordExpiresAt = undefined;
        await User.save();

        await sendResetSuccessEmail(User.email)

        res.status(200).json({success: true, message:"Password reset successful"})
    } catch (error) {
        console.log("Error in resetpassword", error);
        res.status(400).json({success:false, message: error.message})
    }
}

export const checkAuth = async (req, res, next) => {
    try {
        const User = await user.findById(req.userId).select("-password")
        if(!User) res.status(400).json({success:false, message: "User not found"})
        res.status(200).json({success:true, User})
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({success:false, message: error.message})
    }
}