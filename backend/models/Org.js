const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Org", orgSchema);
