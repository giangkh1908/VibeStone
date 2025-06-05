import express from "express";
import { loginUser, registerUser, verifyEmailToken } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/verify-email", verifyEmailToken); // GET method với query params

export default userRouter;