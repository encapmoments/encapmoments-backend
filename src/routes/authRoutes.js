// Express 라우터 불러오기
const express = require("express");
const router = express.Router();

// 컨트롤러: 로그인, 회원가입, 로그아웃 처리 로직
const authController = require("../controllers/authController");
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/authMiddleware");

// 로그인 요청 처리 (일반 로그인)
router.post("/login", authController.login);

// 로그아웃 요청 처리 (로그인 상태 확인 필요)
router.post("/logout", verifyToken, authController.logout);

// Access Token 재발급 요청 처리
router.post("/refreshToken", authController.refreshToken);

// 일반 회원가입 처리 (2단계 - 모든 정보 한 번에 받기)
router.post("/register", authController.completeRegister);

// /logout, /refreshToken 등 인증 필요한 곳에 verifyToken 적용 (문제 없음)

module.exports = router;
