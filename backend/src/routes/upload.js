const express = require('express');
const multer = require('multer');
const { cloudinary, isMock } = require('../config/cloudinary');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// Helper function to upload buffer stream to Cloudinary
const uploadToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    if (isMock) {
      // Mock mode returns a structured dummy URL
      const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
      return resolve({
        secure_url: `https://res.cloudinary.com/mock_cloud/image/upload/naanzi/products/${Date.now()}_${cleanName}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'naanzi/products',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an image file'
        });
      }

      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: result.secure_url
      });
    } catch (error) {
      console.error('Image Upload Error:', error);
      res.status(500).json({
        success: false,
        message: 'Image upload failed',
        error: error.message || error
      });
    }
  }
);

module.exports = router;
