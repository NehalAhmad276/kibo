const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, cartController.addToCart);
router.get('/', authMiddleware, cartController.getCart);
router.put('/update', authMiddleware, cartController.updateCart);
router.delete('/remove/:productId', authMiddleware, cartController.removeFromCart);

module.exports = router;
