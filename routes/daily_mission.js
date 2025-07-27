const express = require('express');
const router = express.Router();

const dailyController = require('../controllers/daily_mission');


// GET /daily_mission - 전체 조회
router.get('/', dailyController.getDailyMissions);
// GET /daily_mission/:daily_id - 상세 조회
router.get('/:daily_id', dailyController.getDailyMissionDetail);

module.exports = router;
// verifyToken 미들웨어가 index.js에서 라우터 전체에 적용됨 (문제 없음)