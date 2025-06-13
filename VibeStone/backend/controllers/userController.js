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
        return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu" });
    }
    
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Tài khoản không tồn tại" });
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
            return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác" });
        }

        const token = createToken(user._id);
        res.status(200).json({ success: true, token, userName: user.name });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng nhập" });
    }
}

// Register user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
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
            return res.status(409).json({ success: false, message: "Tài khoản đã tồn tại và đã được xác thực" });
        }

        // Validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập email hợp lệ" });
        }
        
        // Better password validation
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" });
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
        console.error("Lỗi đăng ký:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi đăng ký" });
    }
}

// Verify email
const verifyEmailToken = async (req, res) => {
    try {
        const { token, email } = req.query;

        console.log('Xác thực email:', { email, token: token?.substring(0, 10) + '...' });

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

        console.log('Email xác thực thành công cho người dùng:', email);

        res.json({ 
            success: true, 
            message: "Email đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.",
            userName: user.name
        });

    } catch (error) {
        console.error('Lỗi xác thực email:', error);
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
        console.error("Lỗi gửi lại email xác thực:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server" 
        });
    }
}

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        console.log('Lấy danh sách người dùng...');
        const users = await userModel.find({}, { password: 0, verificationToken: 0, verificationTokenExpires: 0 });
        console.log('Lấy danh sách người dùng thành công:', users.length);
        res.status(200).json(users);
    } catch (error) {
        console.error('Lỗi lấy danh sách người dùng:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi lấy danh sách người dùng',
            error: error.message 
        });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        console.log('Lấy người dùng theo ID:', req.params.id);
        const user = await userModel.findById(req.params.id, { password: 0, verificationToken: 0, verificationTokenExpires: 0 });
        if (!user) {
            console.log('Không tìm thấy người dùng');
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng' 
            });
        }
        console.log('Tìm thấy người dùng:', user);
        res.status(200).json(user);
    } catch (error) {
        console.error('Lỗi lấy người dùng theo ID:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi lấy người dùng theo ID',
            error: error.message 
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        console.log('Cập nhật người dùng:', req.params.id);
        console.log('Dữ liệu cập nhật:', req.body);
        
        const { name, email } = req.body;
        const user = await userModel.findById(req.params.id);
        
        if (!user) {
            console.log('Không tìm thấy người dùng để cập nhật');
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng để cập nhật' 
            });
        }

        // Check if email is being changed and if it's already in use
        if (email !== user.email) {
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                console.log('Email đã được sử dụng');
                return res.status(400).json({ 
                    success: false,
                    message: 'Email đã được sử dụng' 
                });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;

        const updatedUser = await user.save();
        const { password, verificationToken, verificationTokenExpires, ...userWithoutSensitiveData } = updatedUser.toObject();
        
        console.log('Cập nhật người dùng thành công');
        res.status(200).json({
            success: true,
            data: userWithoutSensitiveData
        });
    } catch (error) {
        console.error('Lỗi cập nhật người dùng:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi cập nhật người dùng',
            error: error.message 
        });
    }
};

// Toggle user verification status
export const toggleVerification = async (req, res) => {
    try {
        console.log('Chuyển đổi trạng thái xác thực cho người dùng:', req.params.id);
        const user = await userModel.findById(req.params.id);
        
        if (!user) {
            console.log('Không tìm thấy người dùng');
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng' 
            });
        }

        user.isVerified = !user.isVerified;
        const updatedUser = await user.save();
        const { password, verificationToken, verificationTokenExpires, ...userWithoutSensitiveData } = updatedUser.toObject();
        
        console.log('Trạng thái xác thực người dùng đã được cập nhật thành công');
        res.status(200).json({
            success: true,
            data: userWithoutSensitiveData
        });
    } catch (error) {
        console.error('Lỗi chuyển đổi trạng thái xác thực:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi cập nhật trạng thái xác thực',
            error: error.message 
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        console.log('Xóa người dùng:', req.params.id);
        const user = await userModel.findById(req.params.id);
        
        if (!user) {
            console.log('User not found for deletion');
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy người dùng để xóa' 
            });
        }

        await userModel.findByIdAndDelete(req.params.id);
        console.log('User deleted successfully');
        res.status(200).json({ 
            success: true,
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting user',
            error: error.message 
        });
    }
};

export { loginUser, registerUser, verifyEmailToken };