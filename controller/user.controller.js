import { error } from "console"
import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"

const registerUser = async (req, res) => {
    // get data
    //validate
    //check if user already exists
    //create a user in database 
    //create a varification token 
    //save token in database
    //send token as email to user
    // send success status to user


    //get data
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "all the field are required",
        })
    }
    try {
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "This email is already exits"
            })
        }
        //if user not exists in database then create this new user
        const user = await User.create({
            name,
            email,
            password,
        })
        console.log(user);

        if (!user) {
            return res.status(400).json({
                message: "User not registered"
            })
        }
        // creating a verification token
        const token = crypto.randomBytes(32).toString('hex');
        console.log(token);

        //save token in database
        user.verificationToken = token;
        await user.save();

        //send token as email to user 
        const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOption = {
            from: process.env.MAILTRAP_SENDEREMAIL,
            to: user.email,
            subject: "Verify your email",
            text: `Please click on the following link : 
            ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
        }

        await transporter.sendMail(mailOption);

        // send success message to the user
        res.status(200).json({
            message: "User registered successfully",
            success: true
        })
        
    }
    catch (err){
        res.status(400).json({
            message: "User not registered",
            error,
            success: false
        })
    }

}

const verifyUser = async (req, res) => {
    //get token from url
    //validate 
    //find user based on token
    //set verified field to true
    //remove verification token
    //save 
    // return responce 

    //get token from url
    const {token} = req.params
    // validation 
    console.log(token)
    if(!token){
        return res.status(400).json({
            message: "Invalid token"
        })
    }
    // find user based on token
    const user = await User.findOne({verificationToken: token})
    // if user not found in database
    if(!user){
        return res.status(400).json({
            message: "Invalid token"
        })
    }
    //set the verifyCation token to true
    user.isVarified = true
    //remove verifycation token 
    user.verificationToken = undefined
    //save all the changes
    await user.save();
}

export { registerUser , verifyUser};