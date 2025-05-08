//profileRoutes.js
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middlewares/authMiddleware");

// storage 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// 프로필 이미지 업로드 엔드포인트
router.post("/upload", verifyToken, upload.single("profile_image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({ profile_image_url: imageUrl });
});

// 프로필 정보 수정 엔드포인트 (이미지 포함)
router.put("/", verifyToken, upload.single("profile_image"), profileController.updateProfile);
// 프로필 정보 수정 (POST도 허용)
router.post("/", verifyToken, upload.single("profile_image"), profileController.updateProfile);

module.exports = router;
