import { User } from "../models/user.model.js";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetMail,
  sendResetSuccessMail,
} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedpassword = await bcryptjs.hash(password, 10);
    //12345 => 4_??**24$78&() => not readable

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedpassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hrs
    });
    await user.save();

    //jwt
    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created Successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const normalizedCode = code.trim();

    const user = await User.findOne({ verificationToken: normalizedCode });
    console.log("User Found:", user);

    console.log(user);

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid or expired verification code",
        });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid email Id" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid Password!!" });
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Successfully Logged In",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    console.log("Error in login ", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged Out Successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "User Not found " });
    }

    //generate token

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = new Date() + 1 * 60 * 60 * 1000;
    console.log(resetTokenExpires)

    user.resetpasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpires;

    await user.save();

    await sendPasswordResetMail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`);
    res.status(200).json({
      success:true,
      message:"Password reset mail sent successfully",
    })
  } catch (err) {
    console.log("Error in Password", err);
    res.status(400).json({ success: false, message: "Error in Password Reset" });
  }
};


export const resetPassword = async (req,res)=>{
  
  try{
    const {token} = req.params;
  const {password} = req.body;
      const user = await User.findOne({
        resetpasswordToken:token,
        // resetPasswordExpiresAt:{$gt: Date.now()}
      });
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or Expired Token" });
      }
      
      // Hash the new password
      const newPassword = await bcryptjs.hash(password, 10);
      
      // Update user password and clear the reset token and expiry
      user.password = newPassword;
      user.resetpasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      
      await user.save();

      await sendResetSuccessMail(user.email);
      res.status(200).json({success:true,message:"Password Reset Successfully"});




  }catch(err){
    console.log("Error in resetting",err);
    res.status(400).json({success:false,message:"Error in Resetting Password"});

  }
}
  
export const checkAuth = async (req,res)=>{
 
  try {
    const user = await User.findById(req.userId).select("-password");
    if(!user) return res.status(401).json({success:false,message:"User Not found"});
   

    res.status(200).json({success:true,user:{...user._doc}});
  } catch (err) {
    console.log("Error in checkAuth",err);
    res.status(401).json({success:false,message:err.message})
    
  }
}
