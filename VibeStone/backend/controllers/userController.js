import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import { sendVerificationEmail, sendWelcomeEmail } from "../config/email.js";

// Create token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// Generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide email and password" });
    }
    
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User does not exist" });
        }

        // Kiểm tra xem tài khoản đã được xác thực chưa
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.",
                needVerification: true,
                email: user.email
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.status(200).json({ success: true, token, userName: user.name });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
}

// Register user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }
    
    try {
        // Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            if (!exists.isVerified) {
                // Nếu user tồn tại nhưng chưa xác thực, gửi lại email xác thực
                const verificationToken = generateVerificationToken();
                const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                
                await userModel.findByIdAndUpdate(exists._id, {
                    verificationToken,
                    verificationTokenExpires
                });
                
                await sendVerificationEmail(email, verificationToken, name);
                
                return res.status(200).json({ 
                    success: true, 
                    message: "Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.",
                    needVerification: true
                });
            }
            return res.status(409).json({ success: false, message: "User already exists and verified" });
        }

        // Validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }
        
        // Better password validation
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const newUser = new userModel({ 
            name, 
            email, 
            password: hashedPassword,
            isVerified: false,
            verificationToken,
            verificationTokenExpires
        });
        
        const user = await newUser.save();
        
        // Send verification email
        const emailResult = await sendVerificationEmail(email, verificationToken, name);
        
        if (emailResult.success) {
            res.status(201).json({ 
                success: true, 
                message: "Đăng ký thành công! Email xác thực đã được gửi đến " + email + ". Vui lòng kiểm tra hộp thư và click vào link để xác thực tài khoản.",
                needVerification: true
            });
        } else {
            // Nếu gửi email thất bại, xóa user đã tạo
            await userModel.findByIdAndDelete(user._id);
            res.status(500).json({ 
                success: false, 
                message: "Đăng ký thất bại. Không thể gửi email xác thực. Vui lòng thử lại."
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ success: false, message: "Server error during registration" });
    }
}

// Verify email
const verifyEmailToken = async (req, res) => {
    try {
        const { token, email } = req.query;

        console.log('Verifying email:', { email, token: token?.substring(0, 10) + '...' });

        // Tìm user với email và verification token
        const user = await userModel.findOne({ 
            email, 
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: "Token xác thực không hợp lệ hoặc đã hết hạn." 
            });
        }

        // Cập nhật user thành verified
        await userModel.findByIdAndUpdate(user._id, {
            isVerified: true,
            verificationToken: undefined,
            verificationTokenExpires: undefined
        });

        console.log('Email verified successfully for user:', email);

        res.json({ 
            success: true, 
            message: "Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.",
            userName: user.name
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Có lỗi xảy ra khi xác thực email. Vui lòng thử lại." 
        });
    }
};

// Resend verification email
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email là bắt buộc" 
            });
        }

        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy tài khoản với email này" 
            });
        }

        if (user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "Tài khoản đã được xác thực" 
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await userModel.findByIdAndUpdate(user._id, {
            verificationToken,
            verificationTokenExpires
        });

        const emailResult = await sendVerificationEmail(email, verificationToken, user.name);
        
        if (emailResult.success) {
            res.status(200).json({ 
                success: true, 
                message: "Email xác thực đã được gửi lại thành công" 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: "Không thể gửi email xác thực" 
            });
        }
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server" 
        });
    }
}

export { loginUser, registerUser, verifyEmailToken };