import {user} from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { senderVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

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

export const login = (req, res) => {
    res.send("login")
}

export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success: true, message:"Logout Successfully"});
}