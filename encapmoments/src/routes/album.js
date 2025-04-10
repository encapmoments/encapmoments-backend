const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album');

// GET /album - 현재 로그인한 사용자의 앨범 목록 조회
router.get('/', albumController.getUserAlbums);

// GET /album_id에 해당하는 앨범 1개 조회회
router.get('/:album_id', albumController.getOneAlbum);

module.exports = router;

