import express from "express"
import { registerUser } from "../controller/user.controller.js";

const router = express.Router();

router.get('/registered', registerUser)

export default router