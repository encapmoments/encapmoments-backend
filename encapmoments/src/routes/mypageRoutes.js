const express = require("express");
const router = express.Router();
const mypageController = require("../controllers/mypageController");
const verifyToken = require("../middlewares/authMiddleware");

// 마이페이지 메인 (렌더링용)
router.get("/", verifyToken, mypageController.renderMypage);

// 개인정보 수정 페이지
router.get("/edit", verifyToken, mypageController.renderEditProfile);

// 내 미션 확인 (JSON 응답용)
router.get("/missions", verifyToken, mypageController.getUserMissionData);

// 미션 히스토리 페이지 렌더링용
router.get("/missions/view", verifyToken, mypageController.renderMissionHistory);

module.exports = router;