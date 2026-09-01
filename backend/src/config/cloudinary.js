const cloudinary = require('cloudinary').v2;

const isMock = process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloud_name';

if (!isMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('WARNING: Cloudinary is running in MOCK mode. Uploads will return mock URLs.');
}

module.exports = {
  cloudinary,
  isMock,
};
