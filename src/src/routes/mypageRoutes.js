const express = require("express");
const router = express.Router();
const mypageController = require("../controllers/mypageController");
const verifyToken = require("../middlewares/authMiddleware");

// 마이페이지 메인 정보 JSON 응답
router.get("/", verifyToken, mypageController.getMypageInfo);

// 수행 미션 조회 (명세서 기준: /mypage/missions)
router.get("/missions", verifyToken, mypageController.getUserMissionData);

module.exports = router;
