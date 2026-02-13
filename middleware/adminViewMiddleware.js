const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.redirect('/');
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
};
