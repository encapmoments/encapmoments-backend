const express = require('express');
const router = express.Router();

const weeklyController = require('../controllers/weekly_mission');

// 전체 주간 미션 조회
router.get('/', weeklyController.getWeeklyMissions);

// 특정 주간 미션 상세 조회
router.get('/:weekly_id', weeklyController.getWeeklyMissionDetail);

// 주간 미션 생성
router.post('/generate', weeklyController.generateWeeklyMissions);

module.exports = router;