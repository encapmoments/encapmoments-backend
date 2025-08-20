const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require("moment-timezone");
const { completeMission } = require("../services/missionService");
const { uploadToS3 } = require("../services/s3Service");
// test

exports.createAlbum = async (req, res) => {
  const userId = req.user.id;
  const { album_title, album_tag, location, mission_type, mission_id } = req.body;

  if (!album_title || !mission_type || !mission_id) {
    return res.status(400).json({ message: '앨범 제목, 미션 타입, 미션 ID는 필수입니다.' });
  }

  const nowKST = moment().tz("Asia/Seoul").toDate();

  try {
    
    //  미션 완료 처리
    try {
       await completeMission(userId, mission_type, parseInt(mission_id));
    } catch (err) {
       console.error(err);
       return res.status(400).json({ message: err.message });
     }
    

    //  S3 업로드
    let album_image_url = null;
    if (req.file) {
      try {
        album_image_url = await uploadToS3(req.file, 'albums');
      } catch (uploadErr) {
        console.error("S3 업로드 실패:", uploadErr);
        return res.status(500).json({ message: "이미지 업로드 실패" });
      }
    }

    //  DB 저장
    await prisma.album.create({
      data: {
        id: userId,
        album_title,
        album_tag,
        album_image: album_image_url,
        location,
        created_at: nowKST,
        uploaded_at: nowKST
      }
    });

    res.status(201).json({ success: true, message: '앨범 생성 성공' });

  } catch (err) {
    console.error('앨범 생성 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 앨범 목록 조회
exports.getUserAlbums = async (req, res) => {
  const userId = req.user.id; // 토큰에서 가져온 user id

  try {
    const albums = await prisma.album.findMany({
      where: { id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        album_id: true,
        album_title: true,
        album_tag: true,
        album_image: true,
        location: true
      }
    });
    console.log(`[GET] /album - userId: ${userId} -> ${albums.length}개 반환됨`);
    res.status(200).json(albums);
    
  } catch (error) {
    console.error('앨범 목록 가져오기 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
};


// 앨범 상세 조회
exports.getOneAlbum = async (req, res) => {
  const albumId = parseInt(req.params.album_id);
  const userId = req.user.id;

  try{
    const oneAlbum = await prisma.album.findUnique({
      where: {
        album_id_id: {
          album_id: albumId,
          id: userId
        }
      },
      select: {
        album_id: true,
        album_title: true,
        album_tag: true,
        album_image: true,
        location: true,
        created_at: true
      }
    });

    if (!oneAlbum) {
      return res.status(404).json({ message: '앨범 없음.' });
    }
    res.json(oneAlbum);
  } 
    catch(err) {
    console.error('앨범 상세 조회 실패', err);
    res.status(500).json({ message: '서버 에러' });
  }
};


// 앨범 삭제
exports.deleteAlbum = async (req, res) =>{
  const userId = req.user.id;
  const albumId = parseInt(req.params.album_id);

  try {
    await prisma.album.delete({
      where: {
        album_id_id: {
          album_id: albumId,
          id: userId
        }
      }
    });
    res.json({ success: true, message: '앨범 삭제 완료'}); // 프론트용
  } catch(err) {
    console.error('앨범 삭제 실패:', err);
    res.status(500).json({ message: '서버 오류'});
  }
};


// 앨범 수정
exports.updateAlbum = async (req, res) => {
  const userId = req.user.id;
  const albumId = parseInt(req.params.album_id);
  const { album_title, album_tag, album_image, location } = req.body;
  const nowKST = moment().tz("Asia/Seoul").toDate();


  try{
    const updated = await prisma.album.update({
      where: {
        album_id_id: {
          album_id: albumId,
          id: userId
        }
      },
      data: {
        album_title,
        album_tag,
        album_image,
        location,
        uploaded_at: nowKST
      }
    });
    res.json({success: true, ...updated}); //
  }catch (err) {    
    console.error('앨범 수정 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};


// 앨범 검색
exports.searchAlbums = async (req, res) => {
  const userId = req.user.id;
  const keyword = req.query.keyword;

  try {
    const results = await prisma.album.findMany({
      where: {
        id: userId,
        OR: [
          { album_title: { contains: keyword } },
          { album_tag: { contains: keyword } },
          { location: { contains: keyword } }       
        ]
      },
      select: {
        album_id: true,
        album_title: true,
        album_tag: true,
        album_image: true,
        location: true
      }
    });
    res.json(results);
  } catch(err) {
    console.error('앨범 검색 실패:', err);
    res.status(500).json({ message: '서버 오류'});
  }
};



