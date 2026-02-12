const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = req.cookies?.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("[Auth Middleware] FATAL: JWT_SECRET is missing in environment variables!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("[Auth Middleware] Token verification failed:");

    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateToken;
