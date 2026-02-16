const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


const router = express.Router();

router.post(
  '/register',
    [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
    ],
    authController.register
  
);
// routes/authRoutes.js
router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.redirect('/forgot-password');

  const token = crypto.randomBytes(32).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  const resetUrl = `/reset-password/${token}`;

  // 🔔 Send email here (example below)
  // console.log('RESET LINK:', resetUrl);
  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password – Kibó',
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below (valid for 15 minutes):</p>
        <a href="${resetUrl}" style="color:#000;font-weight:bold;">
          Reset Password
        </a>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `
  });

  res.redirect('/login');
});

// save new password to data base -----
router.post('/reset-password/:token', async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) return res.redirect('/forgot-password');

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  // user.password = req.body.password; // hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.redirect('/login');
});



router.post('/login', authController.login);

module.exports = router;
