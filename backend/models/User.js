const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["superadmin", "user"],
      default: "user",
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Org",
      index: true,
    },
    orgRole: {
      type: String,
      enum: ["admin", "member"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
