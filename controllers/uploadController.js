exports.uploadImage = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
