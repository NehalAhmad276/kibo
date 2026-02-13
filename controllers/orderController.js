const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');



// CREATE ORDER (Checkout)
exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user.cart.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { shippingAddress,paymentMethod } = req.body;    

    let totalAmount = 0;
    const items = [];

    for (const item of user.cart) {
      if (item.product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${item.product.name}` });
      }

      item.product.stock -= item.quantity;
      await item.product.save();

      totalAmount += item.product.price * item.quantity;

      items.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      shippingAddress, 
      status: 'Pending',
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Pending',
    });

    // Clear cart
    user.cart = [];
    await user.save();

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      'items.product'
    );
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ORDER BY ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADMIN: GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADMIN: UPDATE ORDER STATUS
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = ['Pending', 'Paid', 'Shipped', 'Delivered'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
