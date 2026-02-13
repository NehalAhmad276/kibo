const cloudinary = require('../config/cloudinary');

exports.deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  // Extract public_id from URL
  const parts = imageUrl.split('/');
  const fileName = parts[parts.length - 1];
  const folder = parts[parts.length - 2];

  const publicId = `${folder}/${fileName.split('.')[0]}`;

  await cloudinary.uploader.destroy(publicId);
};
