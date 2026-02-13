const Product = require('../models/Product');

// GET ALL PRODUCTS (Public)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE PRODUCT (Admin only)
exports.createProduct = async (req, res) => {
  try {
    // const productinfo = await Product.create(req.body);
     const {
      productType,
      name,
      brand,
      category,
      description,
      size,
      price,
      stock,
      images
    } = req.body;

    // 🔥 FORCE images to be array of strings
    const imageArray = Array.isArray(images)
      ? images
      : typeof images === 'string'
        ? JSON.parse(images)
        : [];

    const product = await Product.create({
      productType,
      name,
      brand,
      category,
      description,
      size,
      price,
      stock,
      images: imageArray
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PRODUCT (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE PRODUCT (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
