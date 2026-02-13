const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const Order = require('../models/Order'); 

const router = express.Router();

router.post(
  '/payment/upi/:orderId',
  upload.single('paymentProof'),
  async (req, res) => {
    const order = await Order.findById(req.params.orderId);

    order.upiTransactionId = req.body.upiTransactionId;
    order.paymentProof = req.file.path;
    order.paymentStatus = 'Pending';

    await order.save();

    res.redirect('/orders');
  }
);

module.exports = router;