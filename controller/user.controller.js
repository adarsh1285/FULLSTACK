import { error } from "console"
import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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

        transporter.sendMail(mailOption);

        // send success message to the user
        res.status(200).json({
            message: "User registered successfully",
            success: true
        })


    }
    catch (err) {
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
    const { token } = req.params
    // validation 
    console.log(token)
    if (!token) {
        return res.status(400).json({
            message: "Invalid token"
        })
    }
    // find user based on token
    const user = await User.findOne({ verificationToken: token })
    // if user not found in database
    if (!user) {
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
    // success response
    return res.status(200).json({
        message: "Email verified successfully ✅"
    });
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "All field are requird"
        })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "Invalid email and password"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        console.log(isMatch)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email and password"
            })
        }

        const token = jwt.sign({ id: user._id, role: user.role },
            process.env.JWT_SECRET, {
            expiresIn: '24h'
        }
        )

        const cookieOption = {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        }

        res.cookie("token", token, cookieOption);

        res.status(200).json({
            success: true,
            message: "login successfully"
        })

    } catch (err) {
        res.status(400).json({
            message: "User not registered",
            error,
            success: false
        })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "user found",
            user
        })

    } catch (err) {
        return res.status(400).json({
            success: true,
            message: "profile not present here"
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.cookie("token", "", {});
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (err) {
        return res.status(400).json({
            success: true,
            message: "No logout"
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        //get email from req.body
        const { email } = req.body
        console.log(email)
        //find user based on email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(user)
        // token generate 
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');
        // 3. Save token & expire time in DB
        user.resetPasswordToken = resetTokenHashed;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();
        // sent email => design url
        const resetUrl = `${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}`;

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
            subject: "Reset password ",
            text: `Please click on the following link : `,
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`

        }
        // transporter.sendMail(mailOption);
        // res.status(200).json({ message: 'Reset email sent' });
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpires = undefined;
        // await user.save();

        try {
            transporter.sendMail(mailOption);
            res.status(200).json({ message: 'Reset email sent' });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.status(500).json({ message: 'Email sending failed' });
        }

    } catch (err) {
        res.status(400).json({
            message: "An error : reset password email not sent",
            error,
            success: false
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        //collect token from params
        //password from req.body
        const { token } = req.params
        const { newPassword } = req.body
        // Token hash karo
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        // User find karo jiska token match kare
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        // Password update
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({
            message: "Password not reset",
            error,
            success: false
        })
    }
}

export { registerUser, verifyUser, login, getMe, logoutUser, forgotPassword, resetPassword };