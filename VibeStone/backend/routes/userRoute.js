import express from 'express';
import { loginUser, registerUser, verifyEmail, resendVerification } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmail);
userRouter.post("/resend-verification", resendVerification);

export default userRouter;