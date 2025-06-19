const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
  createOrg,
  joinOrg,
  orgDetails,
} = require("../controllers/orgController");

const router = express.Router();

router.get("/org-details", protect, orgDetails);
router.post("/create-org", protect, createOrg);
router.post("/join", protect, joinOrg);

module.exports = router;
