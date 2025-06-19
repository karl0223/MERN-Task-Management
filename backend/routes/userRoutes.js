const express = require("express");
const {
  protect,
  adminOnly,
  requireOrgAdmin,
} = require("../middlewares/authMiddleware");
const {
  getUsers,
  getUserById,
  deleteUser,
  getOrgUsers,
} = require("../controllers/userController");

const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, getUsers); // Get all users (Admin only)
router.get("/org-users", protect, requireOrgAdmin, getOrgUsers); // Get all org users (Admin only)
router.get("/:id", protect, getUserById);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
