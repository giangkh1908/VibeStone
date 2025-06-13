import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.token;
    console.log('Received token:', token); // Debug log
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    const user = await User.findById(decoded.id);
    console.log('Found user:', user); // Debug log

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
      error: error.message
    });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    console.log('Checking admin status for user:', req.user); // Debug log
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập'
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực quyền admin',
      error: error.message
    });
  }
}; 