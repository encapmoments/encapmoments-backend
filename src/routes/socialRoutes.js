const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");
const verifyToken = require("../middlewares/authMiddleware");

// 소셜 로그인 콜백 처리
router.get("/naver/callback", socialController.naverLogin);
router.get("/kakao/callback", socialController.kakaoLogin);

// 소셜 회원가입 (2단계 - 닉네임 + 프로필 이미지 경로 전달)
router.post("/social/register", verifyToken, socialController.registerSocialUser);

module.exports = router;