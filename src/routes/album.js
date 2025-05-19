const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album');

// 앨범 검색
router.get('/search', albumController.searchAlbums);


// 앨범 생성
router.post('/generate', albumController.createAlbum);

// 앨범 목록 조회
router.get('/', albumController.getUserAlbums);

// 앨범 1개 조회
router.get('/:album_id', albumController.getOneAlbum);

// 앨범 삭제
router.delete('/:album_id', albumController.deleteAlbum);

// 앨범 수정
router.patch('/:album_id', albumController.updateAlbum);


module.exports = router;

