import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';

// Tạo signature để client upload trực tiếp lên Cloudinary
const getCloudinarySignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp: timestamp,
      folder: 'vibestone',
      transformation: 'w_800,h_600,c_limit,q_auto,f_auto'
    };

    // Tạo signature
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      signature: signature,
      timestamp: timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: 'vibestone'
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating upload signature'
    });
  }
};

export { getCloudinarySignature };