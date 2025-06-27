import express from "express"
import { forgotPassword, getMe, login, logoutUser, registerUser, resetPassword, verifyUser } from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/registered', registerUser)
router.get('/verify/:token', verifyUser)
router.post('/login', login)
router.get('/profile',isLoggedIn, getMe)
router.get('/logout',isLoggedIn, logoutUser)
router.post('/forgotPassword', forgotPassword)
router.get('/reset-password/:token', resetPassword)



export default router