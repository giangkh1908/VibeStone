import express from "express";
import { loginUser, registerUser, verifyEmailToken, facebookLogin } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/facebook-login", facebookLogin);
userRouter.get("/verify-email", verifyEmailToken);

export default userRouter;