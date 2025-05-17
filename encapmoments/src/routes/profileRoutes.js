// 기존 profileRoutes.js에 추가할 GET /profile/me 라우터 구현
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middlewares/authMiddleware");
const userService = require("../services/userService");

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
