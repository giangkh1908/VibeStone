import express from 'express';
import rateLimit from 'express-rate-limit';
import Feedback from '../models/feedbackModel.js';

const router = express.Router();

// Test route to check database connection and data
router.get('/test', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    console.log('Found feedbacks:', feedbacks); // Debug log
    res.json({
      success: true,
      message: 'Test successful',
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing feedback route',
      error: error.message
    });
  }
});

// Rate limiting for feedback submission
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }
});

// Submit feedback
router.post('/', feedbackLimiter, async (req, res) => {
  try {
    const { content } = req.body;
    const userIP = req.ip || req.connection.remoteAddress;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung góp ý không được để trống'
      });
    }

    const feedback = new Feedback({
      content: content.trim(),
      userIP,
      status: 'pending'
    });

    await feedback.save();
    console.log('Saved feedback:', feedback); // Debug log

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã gửi góp ý!'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi góp ý'
    });
  }
});

// Get all feedbacks (public access)
router.get('/admin', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';

    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    console.log('Query:', query); // Debug log

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(query)
    ]);

    console.log('Found feedbacks:', feedbacks); // Debug log

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page,
        pages,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách góp ý',
      error: error.message
    });
  }
});

// Update feedback status (public access)
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'read', 'deleted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy góp ý'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật trạng thái'
    });
  }
});

// Delete feedback (public access)
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy góp ý'
      });
    }

    res.json({
      success: true,
      message: 'Xóa góp ý thành công'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa góp ý'
    });
  }
});

export default router; 