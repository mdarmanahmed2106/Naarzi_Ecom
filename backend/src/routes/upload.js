const express = require('express');
const multer = require('multer');
const { cloudinary, isMock } = require('../config/cloudinary');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 10MB per image: Cloudinary's free-plan limit, and enough for straight-from-camera photos
const MAX_IMAGE_MB = 10;

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file type. Only images are allowed.');
      err.statusCode = 400;
      cb(err, false);
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

      // Without Cloudinary keys the upload would "succeed" with a fake URL that shows as a broken
      // image on the live site, so production refuses instead
      if (isMock && process.env.NODE_ENV === 'production') {
        return res.status(503).json({
          success: false,
          message: "Image storage isn't set up on the server (Cloudinary keys are missing), so the photo wasn't saved."
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
      // Cloudinary's error details stay in the log above; the response only says what to do about it
      const keysRejected = error.http_code === 401 || error.http_code === 403 || /api[_ ]?key|signature|cloud[_ ]?name/i.test(error.message || '');
      res.status(keysRejected ? 502 : 500).json({
        success: false,
        message: keysRejected
          ? 'Cloudinary rejected the upload. Check the Cloudinary cloud name, API key and secret on the server.'
          : 'Image upload failed. Please try again.'
      });
    }
  }
);

module.exports = router;
