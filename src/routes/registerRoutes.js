const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadImageToS3 } = require("../utils/s3");

// 임시 디렉토리로 업로드 (S3 업로드 후 삭제됨)
const upload = multer({ dest: "temp/" });

// 프로필 이미지 업로드 (1단계 - 소셜/일반 회원가입 공통)
router.post("/image", upload.single("profile_image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "이미지 파일이 없습니다." });
  }

  try {
    const imageUrl = await uploadImageToS3(req.file, "profile-images");
    res.json({ profile_image_url: imageUrl });
  } catch (err) {
    console.error("S3 업로드 오류:", err);
    res.status(500).json({ message: "이미지 업로드 실패" });
  }
});

module.exports = router;
