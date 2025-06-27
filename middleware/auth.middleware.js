import jwt from "jsonwebtoken"
import dotenv from 'dotenv'
dotenv.config()

export const isLoggedIn = async (req, res, next) => {
    try {
        console.log(req.cookies)
        const token = req.cookies?.token
        console.log('Token founded', token)
        if(!token){
            return res.status(401).json({
                success: true,
                message: "Please logIn frist"
            })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('Decoded data is : ', decoded)
        req.user = decoded  // user ko find karne ke liye ye sab kiya gya hai

        next()
    } catch (error) {
        console.log("Authentication failure")
        return res.status(500).json({
            success: true,
            message: "Internal server error"
        })
    }
}