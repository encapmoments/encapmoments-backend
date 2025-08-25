const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Prisma로 DB를 쓴다면 필수임! 
// Prisma ORM의 런타임 클라이언트
// prisma.user.findMany() 같은 타입 안전한 DB 쿼리를 쓰게 해주는 객체를 생성
// DATABASE_URL(예: MySQL, PostgreSQL) 환경변수를 읽어 DB에 연결


const moment = require("moment-timezone");
const { completeMission } = require("../services/missionService");
const { uploadToS3 } = require("../services/s3Service");




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