const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Strict Bearer check
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[Auth Middleware] Missing or malformed Authorization header:", authHeader);
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.error("[Auth Middleware] No token found after Bearer split.");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("[Auth Middleware] FATAL: JWT_SECRET is missing!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`[Auth Middleware] Verification failed: ${err.message}`);
    console.error(`[Auth Middleware] Token received (partial): ${token.substring(0, 10)}...`);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authenticateToken;
