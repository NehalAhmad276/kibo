const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token; // 👈 read from cookie

  if (!token) {
    return res.redirect('/login'); // or 401 for API
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
};
