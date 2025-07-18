import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Middleware to upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    console.log('📤 Uploading to Cloudinary...');
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'vibestone',
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary success:', result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    req.cloudinaryUrl = result.secure_url;
    req.cloudinaryPublicId = result.public_id;
    
    next();
  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi upload ảnh: ' + error.message 
    });
  }
};

export { upload, uploadToCloudinary };