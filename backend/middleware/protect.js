const jwt = require("jsonwebtoken");

/**
 * Middleware — verifies Bearer JWT token on protected routes.
 * Attach to any route that should be admin-only.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized. Token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized. Token invalid or expired." });
  }
};

module.exports = protect;
