
// Express 라우터 불러오기
const express = require("express");
const router = express.Router();

// 컨트롤러: 로그인, 회원가입, 로그아웃 처리 로직
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const { uploadImageToS3 } = require("../utils/s3");

// S3 업로드용 multer 설정
const upload = multer({ dest: "temp/" });

// 로그인 요청 처리 (일반 로그인)
router.post("/login", authController.login);

// 로그아웃 요청 처리 (로그인 상태 확인 필요)
router.post("/logout", verifyToken, authController.logout);

// Access Token 재발급 요청 처리
router.post("/refreshToken", authController.refreshToken);

// 프로필 이미지 업로드 (회원가입 1단계 전용)
router.post("/uploadImage", upload.single("profile_image"), async (req, res) => {
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

// 일반 회원가입 처리 (2단계 - 모든 정보 한 번에 받기)
router.post("/register", authController.completeRegister);

module.exports = router;
