import multer from 'multer';
import path from 'path';
import cloudinary from '../config/cloudinary.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer storage for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/temp');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// Middleware to upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'vibestone', // Create a folder in your Cloudinary account for organization
      use_filename: true
    });

    // Add the Cloudinary URL to the request
    req.cloudinaryUrl = result.secure_url;
    req.cloudinaryPublicId = result.public_id;

    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Delete the temporary file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: 'Lỗi khi tải hình ảnh' });
  }
};

export { upload, uploadToCloudinary };