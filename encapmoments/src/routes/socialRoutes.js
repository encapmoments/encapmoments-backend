const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");

// 소셜 로그인 콜백 처리 
router.get("/callback", socialController.naverLogin);
router.get("/callback", socialController.kakaoLogin);

module.exports = router;