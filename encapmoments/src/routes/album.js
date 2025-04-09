const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album');

// GET /album - 현재 로그인한 사용자의 앨범 목록 조회
router.get('/', albumController.getUserAlbums);

module.exports = router;
