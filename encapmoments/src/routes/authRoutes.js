// Express 라우터 불러오기
const express = require("express");
const router = express.Router();

// 컨트롤러: 로그인, 회원가입, 로그아웃 처리 로직
const authController = require("../controllers/authController");

// 미들웨어: JWT 토큰 인증 처리
const verifyToken = require("../middlewares/authMiddleware");

// 로그인 요청 처리 (일반 로그인)
router.post("/login", authController.login);

// 회원가입 요청 처리
router.post("/register", authController.register);

// 로그아웃 요청 처리 (로그인 상태 확인 필요)
router.post("/logout", verifyToken, authController.logout); // ← access token 검증 후 로그아웃 실행

// 라우터 객체 내보내기
module.exports = router;
