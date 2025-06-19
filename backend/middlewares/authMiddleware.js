const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protec routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (err) {
    res.status(401).json({ message: "Token failed", error: err.message });
  }
};

// Middleware for Admin-only access
const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};

const requireOrgAdmin = async (req, res, next) => {
  const user = req.user;

  if (!user.orgRole || user.orgRole !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  next();
};

const requireAdminAccess = (req, res, next) => {
  const user = req.user;

  if (user?.role === "superadmin" || user?.orgRole === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Access denied: admin only" });
};

module.exports = { protect, adminOnly, requireOrgAdmin, requireAdminAccess };
