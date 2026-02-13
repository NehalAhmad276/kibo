const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post(
  '/image',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  uploadController.uploadImage
);

module.exports = router;
