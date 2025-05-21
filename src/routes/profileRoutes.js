const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const verifyToken = require("../middlewares/authMiddleware");
const userService = require("../services/userService");
const { generateUploadSignedUrl } = require("../utils/s3Signed");

const upload = multer({ dest: "temp/" });

// profile/me: 현재 로그인한 사용자 정보 JSON 응답
router.get("/me", verifyToken, async (req, res) => {
  try {
    const data = await userService.getUserInfo(req.user.id);
    res.json(data);
  } catch (err) {
    console.error("프로필 조회 오류:", err);
    res.status(500).json({ message: "프로필 정보를 불러오는 중 오류 발생" });
  }
});

// 기존 API 유지: 프로필 이미지 업로드 (signed URL 방식 내부적으로 사용)
router.post("/upload", verifyToken, upload.single("profile_image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const file = req.file;
    const contentType = file.mimetype;

    const { url, key } = await generateUploadSignedUrl("profile-images", contentType);
    const imageBuffer = fs.readFileSync(file.path);
    await axios.put(url, imageBuffer, {
      headers: { "Content-Type": contentType },
    });
    fs.unlinkSync(file.path);

    return res.json({ profile_image_url: key });
  } catch (err) {
    console.error("S3 업로드 오류:", err);
    res.status(500).json({ message: "이미지 업로드 실패" });
  }
});

// 프로필 정보 수정 엔드포인트 (이미지 포함)
router.put("/", verifyToken, profileController.updateProfile);
router.post("/", verifyToken, profileController.updateProfile);

module.exports = router;
