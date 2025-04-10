const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserAlbums = async (req, res) => {
  const userId = req.user.id; // 토큰에서 가져온 user id

  try {
    const albums = await prisma.album.findMany({
      where: { id: userId },
      orderBy: { uploaded_at: 'desc' }
    });
    res.json(albums);
  } catch (error) {
    console.error('앨범 목록 가져오기 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
};

exports.getOneAlbum = async (req, res) => {
  const albumId = parseInt(req.params.id);
  const userId = req.user.id;

  try{
    const oneAlbum = await prisma.album.findMany({
      where: {id:userId, album_id:req.param[0]}
    });
    res.json(oneAlbum);
  } catch(error) {
    console.error('앨범ID로 앨범 한개 가져오기 실패:', error);
    res.status(500).json({ message: '서버 에러' });
  }
};




