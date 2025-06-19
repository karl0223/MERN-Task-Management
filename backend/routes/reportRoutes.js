const express = require("express");
const {
  protect,
  requireAdminAccess,
} = require("../middlewares/authMiddleware");
const {
  exportTasksReport,
  exportUsersReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/export/tasks", protect, requireAdminAccess, exportTasksReport);
router.get("/export/users", protect, requireAdminAccess, exportUsersReport);

module.exports = router;
