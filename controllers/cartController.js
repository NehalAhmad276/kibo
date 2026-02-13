const User = require('../models/User');

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.id);

    const existingItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    res.status(200).json({ message: 'Product added to cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE CART
exports.updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const user = await User.findById(req.user.id);

    const item = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!item)
      return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    await user.save();

    res.status(200).json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );

    await user.save();
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
