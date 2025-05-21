const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");
const { generateUploadSignedUrl } = require("../utils/s3Signed");

const upload = multer({ dest: "temp/" });

router.post("/login", authController.login);
router.post("/logout", verifyToken, authController.logout);
router.post("/refreshToken", authController.refreshToken);

// ✅ 클라이언트 요청은 유지: POST /auth/uploadImage
router.post("/uploadImage", upload.single("profile_image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "이미지 파일이 없습니다." });
    }

    const file = req.file;
    const contentType = file.mimetype;

    const { url, key } = await generateUploadSignedUrl("profile-images", contentType);

    // 이미지 파일 S3로 PUT 요청
    const imageBuffer = fs.readFileSync(file.path);
    await axios.put(url, imageBuffer, {
      headers: { "Content-Type": contentType },
    });

    fs.unlinkSync(file.path); // 임시 파일 삭제
    res.json({ profile_image_url: key }); // 또는 full S3 URL 필요 시 처리 가능

  } catch (err) {
    console.error("Signed URL 업로드 오류:", err);
    res.status(500).json({ message: "이미지 업로드 실패" });
  }
});

router.post("/register", authController.completeRegister);

module.exports = router;
