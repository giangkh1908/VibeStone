import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer storage for temporary file storage
const storage = multer.memoryStorage();

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 5MB max file size
});

// Middleware to upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    console.log('📤 Uploading to Cloudinary from buffer...');
    
    // Upload từ buffer thay vì file path
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'vibestone',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    console.log('✅ Cloudinary upload success:', result.secure_url);

    // Add the Cloudinary URL to the request
    req.cloudinaryUrl = result.secure_url;
    req.cloudinaryPublicId = result.public_id;

    next();
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tải hình ảnh: ' + error.message 
    });
  }
};

export { upload, uploadToCloudinary };