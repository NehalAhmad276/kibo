
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
const viewRoutes = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');
const userMiddleware = require('./middleware/userMiddleware');
const adminViewRoutes = require('./routes/adminViewRoutes');
const expressLayouts = require('express-ejs-layouts');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();


app.set('trust proxy', 1);

app.use(cors());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use('/api/upload', uploadRoutes);
app.use(userMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use(paymentRoutes);
// app.use('/api/payment', paymentRoutes);
app.use('/admin', adminViewRoutes);
app.use('/', viewRoutes);

app.get('/', (req, res) => {
  res.send('Perfume E-commerce API running');
});

module.exports = app;

