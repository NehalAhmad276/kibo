require('dotenv').config();
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order'); 
const User = require('../models/User');
const viewAuthMiddleware = require('../middleware/viewAuthMiddleware');
const { none } = require('../middleware/uploadMiddleware');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
  const products = await Product.find({ productType: 'Perfume' }).limit(8);
  const attars = await Product.find({ productType: 'Attar' }).limit(4);
  res.render('pages/home', {
    title: 'Home',
    products,
    attars
  });
});

router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {
      productType: 'Perfume'
    };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const products = await Product.find(filter);
    // const products = await Product.find({ productType: 'Perfume' });

    res.render('pages/product-list', {
      title: 'Products',
      products,
      activeCategory: category || 'All'
    });
  } catch (err) {
    console.log(err);
    res.redirect('/');
  }
});

router.get('/attars', async (req, res) => {
  const attars = await Product.find({ productType: 'Attar' });

  res.render('pages/attars', {
    title: 'Attars',
    attars
  });
});

router.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('pages/product-detail', {
    title: product.name,
    product
  });
});

// ADD TO CART FROM EJS
router.post('/cart/add', async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) return res.redirect('/login');

    await axios.post(
      '/api/cart/add',
      {
        productId: req.body.productId,
        quantity: Number(req.body.quantity)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.redirect('/cart');
  } catch (error) {
    res.redirect('/login');
  }
});

// VIEW CART
router.get('/cart', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.redirect('/login');

    const response = await axios.get(
      '/api/cart',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const cart = response.data;

    const total = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    res.render('pages/cart', {
      title: 'Cart',
      cart,
      total
    });
  } catch (error) {
    res.redirect('/login');
  }
});

// UPDATE CART
router.post('/cart/update', async (req, res) => {
  const token = req.cookies?.token;

  await axios.put(
    '/api/cart/update',
    req.body,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  res.redirect('/cart');
});

// REMOVE FROM CART
router.post('/cart/remove/:productId', async (req, res) => {
  const token = req.cookies?.token;

  await axios.delete(
    `/api/cart/remove/${req.params.productId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  res.redirect('/cart');
});

// SHOW LOGIN
router.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

// SHOW SIGNUP
router.get('/signup', (req, res) => {
  res.render('pages/signup', { title: 'Sign Up' });
});

// SIGNUP
router.post('/signup', async (req, res) => {
  // console.log('SIGNUP BODY:', req.body);
  try {
    await axios.post('/api/auth/register', req.body);
    res.redirect('/login');
  } catch (error) {
    res.redirect('/signup');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  // console.log('LOGIN BODY:', req.body);
  try {
    const response = await axios.post(
      '/api/auth/login',
      req.body
    );

    const token = response.data.token;

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // domain: 'xn--kib-sxa.com',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    res.redirect('/');
  } catch (error) {
    res.redirect('/login');
  }
});

// LOGOUT
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});


// CHECKOUT PAGE
router.get('/checkout', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  const cartRes = await axios.get('/api/cart', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const cart = cartRes.data;
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  res.render('pages/checkout', {
    title: 'Checkout',
    cart,
    total
  });
});

router.post('/checkout/create-order', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    const shippingAddress = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2 || '',
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode
    };
    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).send('Address missing');
    }

    // 1️⃣ Create order (NO PAYMENT GATEWAY)
    const orderRes = await axios.post(
      '/api/orders',
      {
        shippingAddress,
        paymentMethod: 'UPI'
      },
      { headers: {
          Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' } }
    );

    const orderId = orderRes.data.order._id;

    // 2️⃣ Redirect customer to UPI payment page
    res.redirect(`/payment/upi/${orderId}`);

  } catch (error) {
    console.log('Checkout error:', error.response?.data || error.message);
    res.status(500).send('Checkout failed');
  }
});

router.get('/payment/upi/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  res.render('pages/upi-payment', {
    title: 'UPI Payment',
    order
  });
});

router.get('/orders', async (req, res) => {
  const token = req.cookies.token;

  const response = await axios.get(
    '/api/orders/my-orders',
    { headers: { Authorization: `Bearer ${token}` } }
  );

  res.render('pages/orders', {
    title: 'My Orders',
    orders: response.data
  });
});

// forget pasward----
router.get('/forgot-password', (req, res) => {
  res.render('pages/forgot-password', {
    title: 'Forgot Password'
  });
});

// reset pasward---------
router.get('/reset-password/:token', async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.redirect('/forgot-password');

  res.render('pages/reset-password', {
    title: 'Reset Password',
    token: req.params.token
  });
});

// profile--------
router.get('/profile',viewAuthMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);

  res.render('pages/profile', {
    title: 'My Profile',
    user
  });
});


//ploicis route----
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Us'
  });
});
router.get('/privacy-policy', (req, res) => {
  res.render('pages/privacy-policy', { title: 'Privacy Policy' });
});

router.get('/refund-policy', (req, res) => {
  res.render('pages/refund-policy', { title: 'Refund & Returns' });
});

router.get('/shipping-policy', (req, res) => {
  res.render('pages/shipping-policy', { title: 'Shipping Policy' });
});

router.get('/terms', (req, res) => {
  res.render('pages/terms', { title: 'Terms & Conditions' });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us'
  });
});
module.exports = router;
