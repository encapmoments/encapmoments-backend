const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// multer storage 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 프로필 이미지 업로드 (1단계 - 소셜/일반 회원가입 공통)
router.post("/image", upload.single("profile_image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "이미지 파일이 없습니다." });
  }
  const imagePath = `/uploads/${req.file.filename}`;
  res.json({ profile_image_url: imagePath });
});

module.exports = router;
