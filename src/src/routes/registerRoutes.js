const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadToS3 } = require("../services/s3Service");

// multer storage 설정 (S3 업로드에선 사용되지 않음, 기본적인 multer 설정만 필요)
const storage = multer.memoryStorage();  // 메모리 저장 (로컬 파일 시스템에 저장하지 않고 S3에 바로 업로드)

// multer 업로드 미들웨어
const upload = multer({ storage });

// 프로필 이미지 업로드 (S3 업로드로 수정)
router.post("/image", upload.single("profile_image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "이미지 파일이 없습니다." });
    }

    // S3에 업로드
    const imageUrl = await uploadToS3(req.file, 'profile_images'); // 'profile_images' 폴더에 업로드

    // 성공적으로 업로드된 이미지의 URL 반환
    res.json({ profile_image_url: imageUrl });

  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    res.status(500).json({ message: "이미지 업로드 중 오류 발생" });
  }
});

module.exports = router;
