const express = require("express");
const router = express.Router();
const { generateUploadSignedUrl } = require("../utils/s3Signed");

// 프로필 이미지 업로드용 signed URL 발급 (1단계 - 소셜/일반 회원가입 공통)
router.get("/image", async (req, res) => {
  try {
    const { url, key } = await generateUploadSignedUrl("profile-images", "image/jpeg");
    res.json({ uploadUrl: url, key });
  } catch (err) {
    console.error("Signed URL 발급 오류:", err);
    res.status(500).json({ message: "업로드 URL 생성 실패" });
  }
});

module.exports = router;
