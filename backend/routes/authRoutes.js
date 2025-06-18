const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const { Upload } = require("@aws-sdk/lib-storage");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = require("../config/aws-config");

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// S3 Upload
router.post("/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.file;
  const key = `uploads/profile-pics/${Date.now()}-${file.originalname}`;

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL removed because bucket doesn't support ACLs
      },
    });

    const result = await upload.done();

    // Manually construct S3 object URL
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      message: "File uploaded successfully!",
      imageUrl, // manually constructed URL
    });
  } catch (err) {
    console.error("S3 upload error:", err);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

// local upload
// router.post("/upload-image", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
//     req.file.filename
//   }`;

//   res.status(200).json({ imageUrl });
// });

module.exports = router;
