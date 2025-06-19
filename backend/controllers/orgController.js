const Org = require("../models/Org");
const User = require("../models/User");

const crypto = require("crypto");

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex"); // 8-character random code
}

const createOrg = async (req, res) => {
  const { name } = req.body;
  const userId = req.user._id;

  if (!name) {
    return res.status(401).json({ message: "Name is required" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.orgId || user.role === "superadmin") {
    return res
      .status(409)
      .json({ message: "User already have an Organization" });
  }

  const inviteCode = generateInviteCode();

  const newOrg = await Org.create({
    name,
    inviteCode,
  });

  user.orgRole = "admin";
  user.orgId = newOrg._id;

  await user.save();

  res.json(newOrg);
};

const joinOrg = async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.user._id;

  if (!inviteCode) {
    return res.status(401).json({ message: "Invite code is required" });
  }

  const org = await Org.findOne({ inviteCode }).select("-inviteCode");

  if (!org) {
    return res.status(404).json({ message: "Invite code not found" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.orgId || user.role === "superadmin") {
    return res.status(409).json({ message: "User already in an Organization" });
  }

  user.orgRole = "member";
  user.orgId = org._id;

  await user.save();

  res.json({ message: "success" });
};

const orgDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let orgName = "";

    const org = await Org.findById(user.orgId);

    if (!org) {
      return res.status(404).json({ message: "Org not found" });
    }

    return res.json(org);
  } catch (error) {
    console.error("Error fetching org details: ", error.message);
    res
      .status(500)
      .json({ message: "Fetching Org details failed.", error: error.message });
  }
};

module.exports = { createOrg, joinOrg, orgDetails };
