const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', authMiddleware, orderController.createOrder);
router.get('/my-orders', authMiddleware, orderController.getMyOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);



// ADMIN
router.get(
  '/admin/all',
  authMiddleware,
  adminMiddleware,
  orderController.getAllOrders
);

router.put(
  '/admin/:id/status',
  authMiddleware,
  adminMiddleware,
  orderController.updateOrderStatus
);


module.exports = router;
