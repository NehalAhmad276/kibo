
// const multer = require('multer');
// const cloudinary = require('../config/cloudinary');
// const multerStorageCloudinary = require('multer-storage-cloudinary');

// const storage = multerStorageCloudinary({
//   cloudinary: cloudinary,
//   folder: 'perfume-products',
//   allowedFormats: ['jpg', 'png', 'jpeg']
// });

// // console.log('Cloudinary:', cloudinary);

// const upload = multer({ storage });

// module.exports = upload;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'perfume-products',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});

const upload = multer({ storage });

module.exports = upload;
