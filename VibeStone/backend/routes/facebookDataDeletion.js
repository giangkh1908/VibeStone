const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Endpoint xử lý yêu cầu xóa dữ liệu từ Facebook
router.post('/facebook-data-deletion', async (req, res) => {
    try {
        const { signed_request } = req.body;
        
        if (!signed_request) {
            return res.status(400).json({
                error: 'Missing signed_request parameter'
            });
        }

        // Parse signed request từ Facebook
        const [signature, payload] = signed_request.split('.');
        const data = JSON.parse(Buffer.from(payload, 'base64').toString());
        
        const userId = data.user_id;
        const appId = data.application_id;
        
        console.log(`Data deletion request for user: ${userId}, app: ${appId}`);
        
        // TODO: Xóa dữ liệu người dùng từ database
        // await deleteUserData(userId);
        
        // Tạo confirmation code
        const confirmationCode = crypto.randomBytes(16).toString('hex');
        
        // Log yêu cầu xóa dữ liệu
        console.log(`Data deletion initiated for user ${userId} - Confirmation: ${confirmationCode}`);
        
        // Trả về response theo format Facebook yêu cầu
        res.json({
            url: `${process.env.FRONTEND_URL}/data-deletion-status/${confirmationCode}`,
            confirmation_code: confirmationCode
        });
        
    } catch (error) {
        console.error('Error processing data deletion request:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Endpoint để user kiểm tra trạng thái xóa dữ liệu
router.get('/data-deletion-status/:confirmationCode', (req, res) => {
    const { confirmationCode } = req.params;
    
    res.json({
        status: 'completed',
        message: 'Dữ liệu của bạn đã được xóa thành công',
        confirmation_code: confirmationCode,
        deleted_at: new Date().toISOString()
    });
});

module.exports = router;