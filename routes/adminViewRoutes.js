const express = require('express');
const adminGuard = require('../middleware/adminViewMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const upload = require('../middleware/uploadMiddleware');
const { deleteFromCloudinary } = require('../utils/cloudinaryUtils');



const router = express.Router();

// DASHBOARD
router.get('/', adminGuard, async (req, res) => {
  const orders = await Order.countDocuments();
  const products = await Product.countDocuments();

  res.render('admin/dashboard', {
    layout: 'admin/layout',
    title: 'Admin Dashboard',
    stats: { orders, products }
  });
});

// VIEW ALL PRODUCTS
router.get('/products', adminGuard, async (req, res) => {
  const products = await Product.find();

  res.render('admin/products', {
    layout: 'admin/layout',
    title: 'Admin Products',
    products
  });
});

// SHOW ADD PRODUCT FORM
router.get('/products/add', adminGuard, (req, res) => {
  res.render('admin/add-product', {
    layout: 'admin/layout',
    title: 'Add Product'
  });
});

// ADD PRODUCT
router.post(
  '/products/add',
  adminGuard,
  upload.array('images', 5), // 👈 Cloudinary upload
  async (req, res) => {
    try {
      const token = req.cookies.token;

      // Image is ALREADY uploaded to Cloudinary
      const imageUrl = req.files.map(file => file.path);

      const {
        name,
        brand,
        category,
        description,
        size,
        productType
      } = req.body;

      const payload = {
        name,
        brand,
        category,
        description,
        size,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        productType,
        images: imageUrl
      };

      await axios.post(
        '/api/products',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      res.redirect('/admin/products');

    } catch (error) {
      console.log(error.response?.data || error.message || error);
      res.redirect('/admin/products/add');
    }
  }
);

// DELETE PRODUCT
router.post('/products/delete/:id', adminGuard, async (req, res) => {
  const token = req.cookies.token;
  const product = await Product.findById(req.params.id);


   // 🔥 Delete image from Cloudinary
    if (product?.images?.length) {
      await deleteFromCloudinary(product.images[0]);
    }
  await axios.delete(
    `/api/products/${req.params.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  res.redirect('/admin/products');
});

// SHOW EDIT PRODUCT
router.get('/products/edit/:id', adminGuard, async (req, res) => {
  const product = await Product.findById(req.params.id);

  res.render('admin/edit-product', {
    layout: 'admin/layout',
    title: 'Edit Product',
    product
  });
});

// UPDATE PRODUCT with image
router.post(
  '/products/edit/:id',
  adminGuard,
  upload.array('images', 5), // Cloudinary upload
  async (req, res) => {
    try {
      const token = req.cookies.token;
      const product = await Product.findById(req.params.id);

      let updatedData = { ...req.body };

      // If admin uploaded a new image
      if (req.file) {
        updatedData.images = req.files.map(file => file.path);
      }

      await axios.put(
        `/api/products/${req.params.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      res.redirect('/admin/products');

    } catch (error) {
      console.log(error.message);
      res.redirect(`/admin/products/edit/${req.params.id}`);
    }
  }
);

// VIEW ALL ORDERS (ADMIN)
router.get('/orders', adminGuard, async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product');

  res.render('admin/orders', {
    layout: 'admin/layout',
    title: 'Admin Orders',
    orders
  });
});

// UPDATE ORDER STATUS
router.post('/orders/update/:id', adminGuard, async (req, res) => {
  try {
    const token = req.cookies.token;

    await axios.put(
      `/api/orders/admin/${req.params.id}/status`,
      { status: req.body.status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.redirect('/admin/orders');

  } catch (error) {
    console.log(error.message);
    res.redirect('/admin/orders');
  }
});

// ORDER DETAIL PAGE
router.get('/orders/:id', adminGuard, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product');

  res.render('admin/order-detail', {
    layout: 'admin/layout',
    title: 'Order Details',
    order
  });
});

router.post('/orders/mark-paid/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.paymentStatus = 'Paid';
  order.status = 'Paid';
  await order.save();
  res.redirect('/admin/orders');
});


module.exports = router;
// {
//           ...req.body,
//           images: [imageUrl]
//         }